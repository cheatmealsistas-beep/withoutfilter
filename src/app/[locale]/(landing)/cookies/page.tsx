// Cookie Policy Page
// Automatically detects if Iubenda is configured and shows appropriate content

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { brand } from '@/shared/config/brand';

const IUBENDA_COOKIE_URL = process.env.NEXT_PUBLIC_IUBENDA_COOKIE_URL;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.cookies' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function CookiesPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'legal.cookies' });

  // If Iubenda is configured, show iframe with their policy
  if (IUBENDA_COOKIE_URL) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Using Iubenda for Cookie Policy (production-ready)
          </p>
        </div>
        <iframe
          src={IUBENDA_COOKIE_URL}
          className="h-[800px] w-full rounded-lg border"
          title="Cookie Policy"
        />
      </div>
    );
  }

  // Development template
  return (
    <div className="container max-w-4xl py-12">
      {/* Development Warning Banner */}
      <div className="mb-8 rounded-lg border-2 border-red-500 bg-red-50 p-6 dark:bg-red-950/20">
        <h3 className="mb-2 text-lg font-bold text-red-800 dark:text-red-200">
          ⚠️ {t('warning.title')}
        </h3>
        <p className="mb-3 text-sm text-red-700 dark:text-red-300">
          {t('warning.message')}
        </p>
        <a
          href="https://iubenda.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-medium text-red-800 underline dark:text-red-200"
        >
          Configure Iubenda for Production →
        </a>
      </div>

      {/* Cookie Policy Content */}
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
          <h2>{t('sections.necessary.title')}</h2>
          <p>{t('sections.necessary.description')}</p>
          <ul>
            <li>{t('sections.necessary.items.session')}</li>
            <li>{t('sections.necessary.items.auth')}</li>
            <li>{t('sections.necessary.items.preferences')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.analytics.title')}</h2>
          <p>{t('sections.analytics.description')}</p>
          <ul>
            <li>{t('sections.analytics.items.usage')}</li>
            <li>{t('sections.analytics.items.performance')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.marketing.title')}</h2>
          <p>{t('sections.marketing.description')}</p>
          <ul>
            <li>{t('sections.marketing.items.googleAds')}</li>
            <li>{t('sections.marketing.items.metaPixel')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.manage.title')}</h2>
          <p>{t('sections.manage.content')}</p>
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
        </section>
      </article>
    </div>
  );
}
