import { z } from 'zod';

// Organization stats for owner dashboard
export const ownerStatsSchema = z.object({
  totalViews: z.number(),
  totalClicks: z.number(),
  trialDaysRemaining: z.number().nullable(),
  modulesCount: z.number(),
});

export type OwnerStats = z.infer<typeof ownerStatsSchema>;

// Owner dashboard data
export interface OwnerDashboardData {
  organization: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  stats: OwnerStats;
  modules: Array<{
    id: string;
    type: string;
    isEnabled: boolean;
    isPublic: boolean;
    displayOrder: number;
  }>;
  trialEndsAt: string | null;
}
