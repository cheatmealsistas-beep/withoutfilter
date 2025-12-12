import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  isOwnerOfOrganization,
  getOwnerDashboardData,
  OwnerDashboard,
} from '@/features/owner-dashboard';

interface AdminPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function OwnerAdminPage({ params }: AdminPageProps) {
  const { locale, slug } = await params;
  const user = await getUser();

  // Must be authenticated
  if (!user) {
    redirect(`/${locale}/login?redirect=/app/${slug}/admin`);
  }

  // Must be owner of this organization
  const isOwner = await isOwnerOfOrganization(user.id, slug);
  if (!isOwner) {
    notFound();
  }

  // Get dashboard data
  const { data, error } = await getOwnerDashboardData(user.id, slug);

  if (error || !data) {
    notFound();
  }

  return <OwnerDashboard data={data} locale={locale} />;
}
