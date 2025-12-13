import { getTranslations } from 'next-intl/server';
import { AboutHero } from './about-hero';
import { AboutProblem } from './about-problem';
import { AboutMission } from './about-mission';
import { AboutTeam } from './about-team';
import { AboutCTA } from './about-cta';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about' });

  return {
    title: t('meta.title'),
    description: t('meta.description'),
  };
}

export default function AboutPage() {
  return (
    <>
      <AboutHero />
      <AboutProblem />
      <AboutMission />
      <AboutTeam />
      <AboutCTA />
    </>
  );
}
