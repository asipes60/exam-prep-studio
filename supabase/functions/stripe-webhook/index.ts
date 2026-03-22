// EduCare Exam Prep Studio — Stripe Webhook Handler
// Syncs subscription status from Stripe to Supabase.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;

// Verify Stripe webhook signature using the raw body
async function verifySignature(
  payload: string,
  sigHeader: string,
  secret: string,
): Promise<boolean> {
  const parts = sigHeader.split(",").reduce((acc, part) => {
    const [key, value] = part.split("=");
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts["t"];
  const signature = parts["v1"];

  if (!timestamp || !signature) return false;

  // Verify timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > 300) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload),
  );
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return expectedSig === signature;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.text();
    const sigHeader = req.headers.get("stripe-signature");

    if (!sigHeader) {
      return new Response("Missing signature", { status: 400 });
    }

    const isValid = await verifySignature(body, sigHeader, STRIPE_WEBHOOK_SECRET);
    if (!isValid) {
      console.error("Invalid webhook signature");
      return new Response("Invalid signature", { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("Stripe event:", event.type, event.id);

    // Use service role to bypass RLS
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.supabase_user_id;
        const subscriptionId = session.subscription;

        if (!userId) {
          console.error("No supabase_user_id in session metadata");
          break;
        }

        // Fetch subscription details from Stripe
        const subRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
          { headers: { "Authorization": `Bearer ${STRIPE_SECRET_KEY}` } },
        );
        const subscription = await subRes.json();

        // Update profile
        await supabase
          .from("profiles")
          .update({
            subscription_status: "pro",
            stripe_customer_id: session.customer,
          })
          .eq("id", userId);

        // Upsert subscription record
        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: subscription.items?.data?.[0]?.price?.id ?? null,
          status: "active",
          current_period_start: subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000).toISOString()
            : null,
          current_period_end: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : null,
          cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        }, { onConflict: "user_id" });

        console.log(`Activated Pro for user ${userId}`);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("No supabase_user_id in subscription metadata");
          break;
        }

        const status = subscription.status; // active, past_due, canceled, etc.
        const profileStatus =
          status === "active" ? "pro"
          : status === "past_due" ? "pro" // keep pro during grace period
          : "cancelled";

        await supabase
          .from("profiles")
          .update({ subscription_status: profileStatus })
          .eq("id", userId);

        await supabase
          .from("subscriptions")
          .update({
            status: status === "active" ? "active" : status === "past_due" ? "past_due" : "cancelled",
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
          })
          .eq("user_id", userId);

        console.log(`Updated subscription for user ${userId}: ${profileStatus}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata?.supabase_user_id;

        if (!userId) {
          console.error("No supabase_user_id in subscription metadata");
          break;
        }

        await supabase
          .from("profiles")
          .update({ subscription_status: "free" })
          .eq("id", userId);

        await supabase
          .from("subscriptions")
          .update({ status: "cancelled" })
          .eq("user_id", userId);

        console.log(`Cancelled subscription for user ${userId}`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response("Webhook error", { status: 500 });
  }
});
