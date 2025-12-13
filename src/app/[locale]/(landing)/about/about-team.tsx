'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/shared/components/ui/badge';
import { brand } from '@/shared/config/brand';

export function AboutTeam() {
  const t = useTranslations('about.team');

  // Transform founder names from brand config into team member objects
  const team = brand.organization.founders.map((name) => ({
    name,
    initials: name.split(' ').map(n => n[0]).join('')
  }));

  // Don't render section if no founders configured
  if (team.length === 0) {
    return null;
  }

  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge
            variant="secondary"
            className="mb-4 rounded-full px-4 py-1.5 bg-primary/10 text-primary border-0"
          >
            {t('label')}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
          {team.map((member) => (
            <div key={member.name} className="text-center group">
              <div className="relative mb-4 overflow-hidden rounded-2xl aspect-square bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 group-hover:border-primary/30 transition-colors">
                {/* Avatar placeholder with initials */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {member.initials}
                  </span>
                </div>
              </div>
              <h3 className="font-semibold text-foreground">{member.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
