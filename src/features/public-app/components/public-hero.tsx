'use client';

import Image from 'next/image';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight } from 'lucide-react';
import type { PublicApp, HomeContent } from '../types';

interface PublicHeroProps {
  app: PublicApp;
  content: HomeContent;
}

export function PublicHero({ app, content }: PublicHeroProps) {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/50" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
        {/* Logo */}
        {app.logoUrl && (
          <div className="flex justify-center mb-8">
            <Image
              src={app.logoUrl}
              alt={app.name}
              width={120}
              height={120}
              className="rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
          {content.headline}
        </h1>

        {/* Description */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {content.description}
        </p>

        {/* CTA Button */}
        <div className="pt-4">
          <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90"
            asChild
          >
            <a href={content.ctaUrl || '#contact'}>
              {content.ctaText}
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* Owner info */}
        {app.ownerName && (
          <div className="pt-8 flex items-center justify-center gap-3">
            {app.ownerAvatar ? (
              <Image
                src={app.ownerAvatar}
                alt={app.ownerName}
                width={48}
                height={48}
                className="rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-primary-foreground font-semibold bg-primary">
                {app.ownerName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-left">
              <p className="font-medium">{app.ownerName}</p>
              {app.professionalType && (
                <p className="text-sm text-muted-foreground capitalize">
                  {app.professionalType.replace('_', ' ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
