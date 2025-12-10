// ⚠️ LEGAL WARNING
// ==================================================
// This is a TEMPLATE terms of service for DEVELOPMENT PURPOSES ONLY.
// It is NOT legally compliant and should NOT be used in production.
//
// Before launching to production, you MUST:
// 1. Customize with your actual business details (company name, address, etc.)
// 2. Review with a legal professional familiar with your jurisdiction
// 3. Ensure compliance with local consumer protection laws
// 4. Update regularly as laws and your service offerings change
//
// Resources to generate proper legal pages:
// - https://termly.io/ (free terms of service generator)
// - https://iubenda.com/ (SaaS-focused legal pages)
// - Consult with a lawyer specializing in SaaS/digital services
//
// Failure to have proper terms can result in:
// - Unenforceable contracts
// - Liability for disputes
// - Loss of legal protections
// - Regulatory penalties
// ==================================================

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { brand } from '@/shared/config/brand';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'legal.terms' });

  return (
    <div className="container max-w-4xl py-12">
      {/* Legal Review Warning Banner */}
      <div className="mb-8 rounded-lg border-2 border-blue-500 bg-blue-50 p-6 dark:bg-blue-950/20">
        <h3 className="mb-2 text-lg font-bold text-blue-800 dark:text-blue-200">
          📋 {t('warning.title')}
        </h3>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          {t('warning.message')}
        </p>
      </div>

      {/* Terms of Service Content */}
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <h1>{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('lastUpdated')}: {new Date().toLocaleDateString(locale)}
        </p>

        <section>
          <h2>{t('sections.intro.title')}</h2>
          <p>
            {t('sections.intro.content', { companyName: brand.name })}
          </p>
        </section>

        <section>
          <h2>{t('sections.accounts.title')}</h2>
          <p>{t('sections.accounts.content')}</p>
        </section>

        <section>
          <h2>{t('sections.service.title')}</h2>
          <p>{t('sections.service.intro')}</p>
          <ul>
            <li>{t('sections.service.items.illegal')}</li>
            <li>{t('sections.service.items.harm')}</li>
            <li>{t('sections.service.items.abuse')}</li>
            <li>{t('sections.service.items.spam')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.payments.title')}</h2>
          <p>{t('sections.payments.content')}</p>
        </section>

        <section>
          <h2>{t('sections.termination.title')}</h2>
          <p>{t('sections.termination.content')}</p>
        </section>

        <section>
          <h2>{t('sections.liability.title')}</h2>
          <p>
            {t('sections.liability.content', { companyName: brand.name })}
          </p>
        </section>

        <section>
          <h2>{t('sections.changes.title')}</h2>
          <p>{t('sections.changes.content')}</p>
        </section>

        <section>
          <h2>{t('sections.contact.title')}</h2>
          <p>
            {t('sections.contact.content')}
            <br />
            <strong>{brand.name}</strong>
            <br />
            Email: <a href={`mailto:${brand.support}`}>{brand.support}</a>
          </p>
          <p className="text-sm text-muted-foreground">
            {t('sections.contact.updatePrompt')}
          </p>
        </section>
      </article>
    </div>
  );
}
