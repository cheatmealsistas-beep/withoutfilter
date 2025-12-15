'use client';

import Link from 'next/link';
import { useLocale } from 'next-intl';
import { SkipLink } from '@/shared/components/ui/skip-link';
import { brand } from '@/shared/config';

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export function MarketingLayout({ children }: MarketingLayoutProps) {
  const locale = useLocale();

  return (
    <>
      <SkipLink />
      <div className="flex min-h-screen flex-col">
        {/* Sin header - la landing tiene su propio diseño */}
        <main id="main-content" className="flex-1">{children}</main>
      </div>
    </>
  );
}
