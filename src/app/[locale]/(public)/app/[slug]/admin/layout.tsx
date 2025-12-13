import { redirect, notFound } from 'next/navigation';
import { getUser } from '@/shared/auth';
import {
  isOwnerOfOrganization,
  getOrganizationBySlug,
  getUserOrganizations,
  OwnerAdminLayout,
} from '@/features/owner-dashboard';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}

/**
 * Owner Admin Layout
 *
 * Provides consistent sidebar navigation, site selector, and user menu
 * for all admin pages. Resets brand colors to Modulary defaults.
 */
export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
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

  // Get current organization data
  const { data: currentOrg, error: orgError } = await getOrganizationBySlug(slug);
  if (orgError || !currentOrg) {
    notFound();
  }

  // Get all user organizations for the site selector
  const { data: organizations } = await getUserOrganizations(user.id);

  return (
    <div
      style={
        {
          // Reset to Modulary defaults (indigo)
          '--primary': '239 84% 67%',
          '--primary-foreground': '0 0% 100%',
        } as React.CSSProperties
      }
    >
      <OwnerAdminLayout
        currentOrg={currentOrg}
        organizations={organizations}
        user={{
          id: user.id,
          email: user.email,
          avatar: user.avatar,
        }}
      >
        {children}
      </OwnerAdminLayout>
    </div>
  );
}
