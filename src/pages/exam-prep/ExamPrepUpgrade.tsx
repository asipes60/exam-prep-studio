import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase, supabaseUrl, supabaseAnonKey } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  CheckCircle,
  X,
  Sparkles,
  Loader2,
  Crown,
  Zap,
  Shield,
  Settings,
} from 'lucide-react';

const freeFeatures = [
  '3 AI generations per day',
  '10-question quizzes',
  'All 4 exam tracks',
  'Weak area assessment',
  'Study plan generator',
];

const proFeatures = [
  'Unlimited AI generations',
  '25, 50, or 75-question quizzes',
  'All 4 exam tracks',
  'Weak area assessment',
  'Study plan generator',
  'Priority support',
];

export default function ExamPrepUpgrade() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'biannual'>('biannual');
  const [loading, setLoading] = useState(false);

  const isPro = user?.subscriptionStatus === 'pro';

  // Handle success/cancel redirects from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Welcome to Pro! Your subscription is now active.');
    } else if (searchParams.get('cancelled') === 'true') {
      toast.info('Checkout cancelled. You can upgrade anytime.');
    }
  }, [searchParams]);

  async function handleUpgrade() {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      // Use env var for price IDs, fallback to placeholders
      const priceId = billingCycle === 'monthly'
        ? (import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'MONTHLY_PRICE_ID_NOT_SET')
        : (import.meta.env.VITE_STRIPE_BIANNUAL_PRICE_ID || 'BIANNUAL_PRICE_ID_NOT_SET');

      const res = await fetch(`${supabaseUrl}/functions/v1/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSubscription() {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Not authenticated');

      const res = await fetch(`${supabaseUrl}/functions/v1/billing-portal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': supabaseAnonKey,
        },
        body: '{}',
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-custom py-12 md:py-20 max-w-4xl">
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center mx-auto mb-4">
          <Crown className="w-7 h-7 text-amber-600" />
        </div>
        <h1 className="heading-2 text-slate-900 mb-3">
          {isPro ? 'Your Pro Subscription' : 'Upgrade to Pro'}
        </h1>
        <p className="text-slate-500 max-w-md mx-auto">
          {isPro
            ? 'Manage your subscription and billing.'
            : 'Unlock unlimited generations, larger quizzes, and accelerate your exam prep.'}
        </p>
      </div>

      {isPro ? (
        // Pro user — manage subscription
        <div className="max-w-md mx-auto">
          <Card className="border-amber-200 bg-amber-50/30">
            <CardContent className="p-6 text-center">
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 mb-4">
                <Crown className="w-3 h-3 mr-1" />
                Pro Active
              </Badge>
              <p className="text-sm text-slate-600 mb-6">
                You have unlimited generations, large quizzes, and full access to all features.
              </p>
              <Button
                onClick={handleManageSubscription}
                disabled={loading}
                variant="outline"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Settings className="w-4 h-4 mr-2" />
                )}
                Manage Subscription
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Free user — show pricing
        <>
          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                billingCycle === 'biannual'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
              onClick={() => setBillingCycle('biannual')}
            >
              6 Months
              <Badge className="ml-2 bg-emerald-100 text-emerald-700 text-xs">Save 17%</Badge>
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Free Tier */}
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <h3 className="font-montserrat font-semibold text-slate-900 mb-1">Free</h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  $0<span className="text-sm font-normal text-slate-400">/month</span>
                </p>
                <p className="text-xs text-slate-400 mb-6">Get started with the basics</p>

                <ul className="space-y-3">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-sm text-slate-400">
                    <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    25/50/75-question quizzes
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-400">
                    <X className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                    Unlimited generations
                  </li>
                </ul>

                <Button variant="outline" className="w-full mt-6" disabled>
                  Current Plan
                </Button>
              </CardContent>
            </Card>

            {/* Pro Tier */}
            <Card className="border-2 border-blue-300 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-blue-600 text-white px-3">Most Popular</Badge>
              </div>
              <CardContent className="p-6">
                <h3 className="font-montserrat font-semibold text-slate-900 mb-1 flex items-center gap-2">
                  Pro <Zap className="w-4 h-4 text-amber-500" />
                </h3>
                <p className="text-3xl font-bold text-slate-900 mb-1">
                  {billingCycle === 'monthly' ? '$24' : '$119'}
                  <span className="text-sm font-normal text-slate-400">
                    /{billingCycle === 'monthly' ? 'month' : '6 months'}
                  </span>
                </p>
                <p className="text-xs text-slate-400 mb-6">
                  {billingCycle === 'biannual'
                    ? 'That\'s ~$19.83/month — save $25 vs monthly'
                    : 'Or $119 for 6 months and save 17%'}
                </p>

                <ul className="space-y-3">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                      <CheckCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 h-11"
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Upgrade to Pro
                </Button>

                <div className="flex items-center justify-center gap-1.5 mt-3">
                  <Shield className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">Cancel anytime</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
