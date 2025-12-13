'use client';

import { useTranslations } from 'next-intl';
import { Layers, Code2, Palette } from 'lucide-react';

const values = [
  {
    icon: Layers,
    key: 'mission',
    gradient: 'from-primary/20 to-primary/5'
  },
  {
    icon: Code2,
    key: 'vision',
    gradient: 'from-accent/20 to-accent/5'
  },
  {
    icon: Palette,
    key: 'values',
    gradient: 'from-pink-500/20 to-pink-500/5'
  }
];

export function AboutMission() {
  const t = useTranslations('about.mission');

  return (
    <section className="py-24 md:py-32 bg-muted/20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {values.map((item) => (
            <div
              key={item.key}
              className="relative group"
            >
              {/* Glow effect on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity`} />

              <div className="relative h-full p-8 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm hover:border-primary/20 transition-colors">
                {/* Icon */}
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 mb-6">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {t(`${item.key}.title`)}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {t(`${item.key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
