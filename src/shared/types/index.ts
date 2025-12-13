// Shared TypeScript types across the application

export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  language: 'en' | 'es';
  timezone: string | null;
};

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
};

/**
 * Attribution data captured from URL parameters and cookies
 * Used for tracking marketing campaigns, referrals, and conversions
 */
export type AttributionData = {
  // Custom tracking
  via?: string;

  // Standard UTM parameters
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;

  // Google Ads
  gclid?: string;

  // Meta/Facebook
  fbclid?: string;
  fbc?: string;
  fbp?: string;

  // TikTok
  ttclid?: string;

  // Metadata
  referrer?: string;
  landing_page?: string;
  device_type?: 'desktop' | 'mobile' | 'tablet';
  user_agent?: string;
  timestamp?: string;
};
