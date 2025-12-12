'use server';

import { revalidatePath } from 'next/cache';
import { getUser } from '@/shared/auth';
import { createClient } from '@supabase/supabase-js';

// Admin client for bypassing RLS
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Start a 90-day trial for the user
 */
export async function startTrialAction(): Promise<{ success: boolean; error: string | null }> {
  const user = await getUser();

  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  const supabase = createAdminClient();

  // Calculate trial end date (90 days from now)
  const trialEndDate = new Date();
  trialEndDate.setDate(trialEndDate.getDate() + 90);

  // Update profile to mark trial started
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      trial_started_at: new Date().toISOString(),
      trial_ends_at: trialEndDate.toISOString(),
    })
    .eq('id', user.id);

  if (profileError) {
    return { success: false, error: profileError.message };
  }

  revalidatePath('/dashboard');
  return { success: true, error: null };
}
