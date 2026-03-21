// EduCare Exam Prep Studio — Gemini Generation Edge Function
// Proxies requests to Google Gemini 2.0 Flash, keeping the API key server-side.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Type helpers (mirrors frontend types) ──────────────────────────────

interface GenerateRequest {
  systemPrompt: string;
  userPrompt: string;
  studyFormat: string;
  config: {
    licenseType: string;
    topic: string;
    difficulty: string;
    itemCount: number;
    includeRationales: boolean;
    californiaEmphasis: boolean;
    isBeginnerReview: boolean;
  };
}

// ─── JSON Schema definitions for structured Gemini output ───────────────

const questionSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    stem: { type: "STRING" },
    choices: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          text: { type: "STRING" },
        },
        required: ["label", "text"],
      },
    },
    correctAnswer: { type: "STRING" },
    rationale: { type: "STRING" },
    incorrectRationales: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          label: { type: "STRING" },
          explanation: { type: "STRING" },
        },
        required: ["label", "explanation"],
      },
    },
    topic: { type: "STRING" },
    difficulty: { type: "STRING" },
  },
  required: [
    "id",
    "stem",
    "choices",
    "correctAnswer",
    "rationale",
    "incorrectRationales",
    "topic",
    "difficulty",
  ],
};

const flashcardSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    front: { type: "STRING" },
    back: { type: "STRING" },
    category: { type: "STRING" },
    topic: { type: "STRING" },
  },
  required: ["id", "front", "back", "category", "topic"],
};

const studyGuideSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    title: { type: "STRING" },
    topic: { type: "STRING" },
    sections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          id: { type: "STRING" },
          title: { type: "STRING" },
          overview: { type: "STRING" },
          keyTerms: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                term: { type: "STRING" },
                definition: { type: "STRING" },
              },
              required: ["term", "definition"],
            },
          },
          practicalTakeaways: { type: "ARRAY", items: { type: "STRING" } },
          commonExamTraps: { type: "ARRAY", items: { type: "STRING" } },
          memoryAids: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: [
          "id",
          "title",
          "overview",
          "keyTerms",
          "practicalTakeaways",
          "commonExamTraps",
          "memoryAids",
        ],
      },
    },
  },
  required: ["id", "title", "topic", "sections"],
};

const quickReferenceSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    title: { type: "STRING" },
    topic: { type: "STRING" },
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          heading: { type: "STRING" },
          content: { type: "STRING" },
        },
        required: ["heading", "content"],
      },
    },
  },
  required: ["id", "title", "topic", "items"],
};

const vignetteSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    clientPresentation: { type: "STRING" },
    demographics: { type: "STRING" },
    presentingProblem: { type: "STRING" },
    relevantHistory: { type: "STRING" },
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          questionText: { type: "STRING" },
          competencyArea: { type: "STRING" },
          choices: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING" },
                text: { type: "STRING" },
              },
              required: ["label", "text"],
            },
          },
          correctAnswer: { type: "STRING" },
          rationale: { type: "STRING" },
          incorrectRationales: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                label: { type: "STRING" },
                explanation: { type: "STRING" },
              },
              required: ["label", "explanation"],
            },
          },
        },
        required: [
          "questionText",
          "competencyArea",
          "choices",
          "correctAnswer",
          "rationale",
          "incorrectRationales",
        ],
      },
    },
  },
  required: [
    "id",
    "clientPresentation",
    "demographics",
    "presentingProblem",
    "relevantHistory",
    "questions",
  ],
};

const studyPlanSchema = {
  type: "OBJECT",
  properties: {
    id: { type: "STRING" },
    title: { type: "STRING" },
    licenseType: { type: "STRING" },
    timeHorizon: { type: "STRING" },
    weeklyPlan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          week: { type: "INTEGER" },
          focus: { type: "STRING" },
          materialTypes: { type: "ARRAY", items: { type: "STRING" } },
          reviewCadence: { type: "STRING" },
          practiceFrequency: { type: "STRING" },
          topics: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: [
          "week",
          "focus",
          "materialTypes",
          "reviewCadence",
          "practiceFrequency",
          "topics",
        ],
      },
    },
    weakAreas: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["id", "title", "licenseType", "timeHorizon", "weeklyPlan", "weakAreas"],
};

function getResponseSchema(studyFormat: string) {
  switch (studyFormat) {
    case "practice_questions":
      return { type: "ARRAY", items: questionSchema };
    case "clinical_vignette":
      return { type: "ARRAY", items: vignetteSchema };
    case "flashcards":
      return { type: "ARRAY", items: flashcardSchema };
    case "study_guide":
      return studyGuideSchema;
    case "quick_reference":
      return quickReferenceSchema;
    case "study_plan":
      return studyPlanSchema;
    default:
      // Backward compat: old formats that used question arrays
      return { type: "ARRAY", items: questionSchema };
  }
}

// ─── Main handler ───────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify auth — require a valid Supabase JWT
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check daily usage limit
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status, daily_generations, daily_generations_reset_at")
      .eq("id", user.id)
      .single();

    if (profile) {
      const resetAt = new Date(profile.daily_generations_reset_at);
      const now = new Date();
      let currentCount = profile.daily_generations;

      // Reset counter if it's a new day
      if (now.toDateString() !== resetAt.toDateString()) {
        currentCount = 0;
        await supabase
          .from("profiles")
          .update({
            daily_generations: 0,
            daily_generations_reset_at: now.toISOString(),
          })
          .eq("id", user.id);
      }

      // Enforce free tier limit (3/day)
      if (profile.subscription_status === "free" && currentCount >= 3) {
        return new Response(
          JSON.stringify({
            error: "Daily generation limit reached",
            message: "Free accounts are limited to 3 generations per day. Upgrade to Pro for unlimited access.",
            limitReached: true,
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Parse request
    const body: GenerateRequest = await req.json();
    const { systemPrompt, userPrompt, studyFormat, config } = body;

    if (!systemPrompt || !userPrompt || !studyFormat) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build Gemini request with structured output
    const responseSchema = getResponseSchema(studyFormat);

    const geminiBody = {
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.7,
        maxOutputTokens: 16384,
      },
    };

    // Call Gemini
    const geminiRes = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiBody),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      return new Response(
        JSON.stringify({ error: "AI generation failed", details: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      console.error("Failed to parse Gemini JSON:", rawText.slice(0, 500));
      return new Response(
        JSON.stringify({ error: "AI returned invalid JSON" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Increment daily usage counter
    if (profile) {
      const resetAt = new Date(profile.daily_generations_reset_at);
      const now = new Date();
      const currentCount =
        now.toDateString() !== resetAt.toDateString() ? 0 : profile.daily_generations;

      await supabase
        .from("profiles")
        .update({
          daily_generations: currentCount + 1,
          daily_generations_reset_at: now.toISOString(),
        })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({ data: parsed, model: "gemini-2.0-flash" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
