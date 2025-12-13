import Link from 'next/link';
import { ArrowRight, Sparkles, Clock, Users } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface CTASectionModularyProps {
  locale: string;
}

/**
 * CTA Section - Modulary Style
 * Final call-to-action with urgency and social proof
 */
export function CTASectionModulary({ locale }: CTASectionModularyProps) {
  const content = locale === 'es'
    ? {
        headline: '¿Listo para Unificar Tu Negocio?',
        subheadline: 'Únete a miles de profesionales que dejaron de hacer malabares con herramientas y empezaron a prosperar.',
        cta: 'Crea Tu App Gratis',
        secondaryCta: 'Ver Demo',
        stats: [
          { icon: Users, value: '1,000+', label: 'Profesionales activos' },
          { icon: Clock, value: '10 min', label: 'Para crear tu app' },
          { icon: Sparkles, value: '0', label: 'Líneas de código' }
        ]
      }
    : {
        headline: 'Ready to Unify Your Business?',
        subheadline: 'Join thousands of professionals who stopped juggling tools and started thriving.',
        cta: 'Build Your App Free',
        secondaryCta: 'Watch Demo',
        stats: [
          { icon: Users, value: '1,000+', label: 'Active professionals' },
          { icon: Clock, value: '10 min', label: 'To build your app' },
          { icon: Sparkles, value: '0', label: 'Lines of code' }
        ]
      };

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/10" />

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

      <div className="container relative mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            {content.headline}
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {content.subheadline}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              <Link href="/register">
                {content.cta}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-14 px-8 text-base rounded-xl border-2 bg-background/50 backdrop-blur-sm hover:bg-background/80"
            >
              <Link href="#how-it-works">
                {content.secondaryCta}
              </Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-xl mx-auto">
            {content.stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-background/50 backdrop-blur-sm mb-3">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
