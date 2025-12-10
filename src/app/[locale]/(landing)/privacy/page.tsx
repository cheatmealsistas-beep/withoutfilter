// Privacy Policy Page
// Automatically detects if Iubenda is configured and shows appropriate content

import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';
import { brand } from '@/shared/config/brand';

const IUBENDA_PRIVACY_URL = process.env.NEXT_PUBLIC_IUBENDA_PRIVACY_URL;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default async function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'legal.privacy' });

  // If Iubenda is configured, show iframe with their policy
  if (IUBENDA_PRIVACY_URL) {
    return (
      <div className="container max-w-6xl py-12">
        <div className="mb-6 rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950/20">
          <p className="text-sm text-green-800 dark:text-green-200">
            ✓ Using Iubenda for Privacy Policy (production-ready)
          </p>
        </div>
        <iframe
          src={IUBENDA_PRIVACY_URL}
          className="h-[800px] w-full rounded-lg border"
          title="Privacy Policy"
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

      {/* Privacy Policy Content */}
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
          <h2>{t('sections.dataCollection.title')}</h2>
          <p>{t('sections.dataCollection.intro')}</p>
          <ul>
            <li>{t('sections.dataCollection.items.email')}</li>
            <li>{t('sections.dataCollection.items.payment')}</li>
            <li>{t('sections.dataCollection.items.usage')}</li>
            <li>{t('sections.dataCollection.items.cookies')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.dataUsage.title')}</h2>
          <p>{t('sections.dataUsage.intro')}</p>
          <ul>
            <li>{t('sections.dataUsage.items.service')}</li>
            <li>{t('sections.dataUsage.items.communication')}</li>
            <li>{t('sections.dataUsage.items.improvements')}</li>
            <li>{t('sections.dataUsage.items.legal')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.dataSharing.title')}</h2>
          <p>{t('sections.dataSharing.intro')}</p>
          <ul>
            <li>
              <strong>Stripe:</strong> {t('sections.dataSharing.stripe')}
            </li>
            <li>
              <strong>Supabase:</strong> {t('sections.dataSharing.supabase')}
            </li>
          </ul>
        </section>

        <section>
          <h2>{t('sections.yourRights.title')}</h2>
          <p>{t('sections.yourRights.intro')}</p>
          <ul>
            <li>{t('sections.yourRights.rights.access')}</li>
            <li>{t('sections.yourRights.rights.rectification')}</li>
            <li>{t('sections.yourRights.rights.erasure')}</li>
            <li>{t('sections.yourRights.rights.portability')}</li>
            <li>{t('sections.yourRights.rights.objection')}</li>
            <li>{t('sections.yourRights.rights.withdrawal')}</li>
          </ul>
          <p>
            {t('sections.yourRights.contact')}{' '}
            <a href={`mailto:${brand.support}`}>{brand.support}</a>
          </p>
        </section>

        <section>
          <h2>{t('sections.dataSecurity.title')}</h2>
          <p>{t('sections.dataSecurity.content')}</p>
        </section>

        <section>
          <h2>{t('sections.cookies.title')}</h2>
          <p>{t('sections.cookies.content')}</p>
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
