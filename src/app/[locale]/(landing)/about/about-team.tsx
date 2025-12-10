'use client';

import { useTranslations } from 'next-intl';
import { FadeIn } from '@/shared/components/magic-ui';
import { brand } from '@/shared/config/brand';

export function AboutTeam() {
  const t = useTranslations('about.team');

  // Transform founder names from brand config into team member objects
  const team = brand.organization.founders.map((name) => ({
    name,
    image: '/team/placeholder.jpg',
  }));

  // Don't render section if no founders configured
  if (team.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-24 border-t">
      <FadeIn>
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary mb-3 tracking-wider uppercase">
            {t('label')}
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>
      </FadeIn>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {team.map((member, index) => (
          <FadeIn key={member.name} delay={index * 0.1}>
            <div className="text-center group">
              <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-muted">
                {/* Placeholder - replace with actual Image component when you have photos */}
                <div className="absolute inset-0 flex items-center justify-center text-4xl text-muted-foreground/50">
                  {member.name.charAt(0)}
                </div>
              </div>
              <h3 className="font-semibold">{member.name}</h3>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
