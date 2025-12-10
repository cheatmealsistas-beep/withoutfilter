'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function StickyCTA() {
  const t = useTranslations('affiliates.stickyCta');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Detect when the form is visible on screen
    const formSection = document.getElementById('affiliate-form');

    if (!formSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // If form is visible, hide sticky
          // If form is not visible, show sticky (only after scrolling)
          setIsVisible(!entry.isIntersecting && window.scrollY > window.innerHeight * 0.3);
        });
      },
      {
        threshold: 0.1 // Activated when at least 10% of form is visible
      }
    );

    observer.observe(formSection);

    // Also listen to scroll to show/hide based on position
    const handleScroll = () => {
      const formSection = document.getElementById('affiliate-form');
      if (!formSection) return;

      const rect = formSection.getBoundingClientRect();
      const isFormVisible = rect.top < window.innerHeight && rect.bottom > 0;

      // Show only if: scrolled more than 30% and form is NOT visible
      const scrolled = window.scrollY > window.innerHeight * 0.3;
      setIsVisible(scrolled && !isFormVisible);
    };

    window.addEventListener('scroll', handleScroll);

    // Execute once on mount
    handleScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    const formSection = document.getElementById('affiliate-form');
    if (formSection) {
      formSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-auto animate-in slide-in-from-bottom-5 duration-300">
      <Button
        size="lg"
        onClick={handleClick}
        className="w-full md:w-auto shadow-2xl hover:shadow-3xl transition-all duration-300 px-6 py-4 rounded-full flex flex-col items-center gap-0 group"
      >
        <div className="flex items-center">
          <span>{t('text')}</span>
          <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
        <span className="text-[10px] opacity-60 -mt-1">{t('subtext')}</span>
      </Button>
    </div>
  );
}