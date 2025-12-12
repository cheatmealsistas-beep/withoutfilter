'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { startTrialAction } from './actions';
import { toast } from 'sonner';

const plans = [
  {
    id: 'free',
    featured: false,
    priceMonthly: 0,
    features: ['storage_basic', 'modules_basic', 'support_community'],
  },
  {
    id: 'premium',
    featured: true,
    priceMonthly: 19,
    features: ['storage_extended', 'modules_all', 'support_priority', 'custom_domain'],
  },
  {
    id: 'pro',
    featured: false,
    priceMonthly: 49,
    features: ['storage_unlimited', 'modules_all', 'support_priority', 'custom_domain', 'ai_creator', 'analytics_advanced'],
  },
];

export default function PricingPage() {
  const t = useTranslations('pricing');
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleStartTrial = async () => {
    setLoading(true);
    setSelectedPlan('free');

    const result = await startTrialAction();

    if (result.success) {
      toast.success(t('trial_started'));
      router.push('/dashboard');
    } else {
      toast.error(result.error || t('error_generic'));
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (planId === 'free') {
      await handleStartTrial();
      return;
    }

    // For paid plans, just start trial for now (Stripe integration later)
    setLoading(true);
    setSelectedPlan(planId);

    const result = await startTrialAction();

    if (result.success) {
      toast.success(t('trial_started'));
      router.push('/dashboard');
    } else {
      toast.error(result.error || t('error_generic'));
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <Badge variant="secondary" className="mt-4">
            {t('trial_badge')}
          </Badge>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative flex flex-col",
                plan.featured && "border-primary shadow-lg scale-105"
              )}
            >
              {plan.featured && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {t('popular')}
                </Badge>
              )}

              <CardHeader>
                <CardTitle>{t(`plans.${plan.id}.name`)}</CardTitle>
                <CardDescription>{t(`plans.${plan.id}.description`)}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    {plan.priceMonthly === 0 ? t('free') : `${plan.priceMonthly}€`}
                  </span>
                  {plan.priceMonthly > 0 && (
                    <span className="text-muted-foreground">/{t('month')}</span>
                  )}
                </div>

                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{t(`features.${feature}`)}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.featured ? "default" : "outline"}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading}
                >
                  {loading && selectedPlan === plan.id
                    ? t('loading')
                    : plan.priceMonthly === 0
                      ? t('start_free')
                      : t('select_plan')
                  }
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Skip link */}
        <div className="text-center">
          <button
            onClick={handleStartTrial}
            disabled={loading}
            className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline transition-colors"
          >
            {t('skip_for_now')}
          </button>
        </div>
      </div>
    </div>
  );
}
