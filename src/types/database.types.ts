export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      affiliate_referrals: {
        Row: {
          affiliate_code: string | null
          affiliate_id: string
          commission_amount: number | null
          created_at: string | null
          currency: string | null
          customer_email: string
          customer_id: string | null
          event_data: Json | null
          event_type: string
          id: string
          referral_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          affiliate_code?: string | null
          affiliate_id: string
          commission_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_email: string
          customer_id?: string | null
          event_data?: Json | null
          event_type: string
          id?: string
          referral_id: string
          status: string
          updated_at?: string | null
        }
        Update: {
          affiliate_code?: string | null
          affiliate_id?: string
          commission_amount?: number | null
          created_at?: string | null
          currency?: string | null
          customer_email?: string
          customer_id?: string | null
          event_data?: Json | null
          event_type?: string
          id?: string
          referral_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_modules: {
        Row: {
          content: Json | null
          created_at: string | null
          display_order: number | null
          id: string
          is_enabled: boolean | null
          is_public: boolean | null
          organization_id: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          is_public?: boolean | null
          organization_id: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_enabled?: boolean | null
          is_public?: boolean | null
          organization_id?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          category: string
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          stripe_customer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_customer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          stripe_customer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          joined_at: string | null
          organization_id: string
          role: string
          user_id: string
        }
        Insert: {
          joined_at?: string | null
          organization_id: string
          role?: string
          user_id: string
        }
        Update: {
          joined_at?: string | null
          organization_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          attribution_data: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_personal: boolean | null
          logo_url: string | null
          name: string
          primary_color: string | null
          slug: string | null
          tagline: string | null
          updated_at: string | null
        }
        Insert: {
          attribution_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_personal?: boolean | null
          logo_url?: string | null
          name: string
          primary_color?: string | null
          slug?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Update: {
          attribution_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_personal?: boolean | null
          logo_url?: string | null
          name?: string
          primary_color?: string | null
          slug?: string | null
          tagline?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string | null
          id: string
          locale: string | null
          path: string
          referrer: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          visitor_hash: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          locale?: string | null
          path: string
          referrer?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_hash: string
        }
        Update: {
          created_at?: string | null
          id?: string
          locale?: string | null
          path?: string
          referrer?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          visitor_hash?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          attribution_data: Json | null
          avatar_url: string | null
          created_at: string | null
          current_organization_id: string | null
          full_name: string | null
          id: string
          language: string | null
          onboarding_completed_at: string | null
          onboarding_skipped_at: string | null
          onboarding_step: number | null
          professional_type: string | null
          timezone: string | null
          updated_at: string | null
          user_flags: string[] | null
        }
        Insert: {
          attribution_data?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          full_name?: string | null
          id: string
          language?: string | null
          onboarding_completed_at?: string | null
          onboarding_skipped_at?: string | null
          onboarding_step?: number | null
          professional_type?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_flags?: string[] | null
        }
        Update: {
          attribution_data?: Json | null
          avatar_url?: string | null
          created_at?: string | null
          current_organization_id?: string | null
          full_name?: string | null
          id?: string
          language?: string | null
          onboarding_completed_at?: string | null
          onboarding_skipped_at?: string | null
          onboarding_step?: number | null
          professional_type?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_flags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_current_org"
            columns: ["current_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          attribution_data: Json | null
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          cancellation_details: Json | null
          cancellation_reason: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          price_amount: number | null
          price_currency: string | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          trial_end_at: string | null
          trial_start_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attribution_data?: Json | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_details?: Json | null
          cancellation_reason?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id: string
          metadata?: Json | null
          organization_id?: string | null
          price_amount?: number | null
          price_currency?: string | null
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          trial_end_at?: string | null
          trial_start_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attribution_data?: Json | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          cancellation_details?: Json | null
          cancellation_reason?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          price_amount?: number | null
          price_currency?: string | null
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          trial_end_at?: string | null
          trial_start_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_page_views: { Args: never; Returns: undefined }
      get_app_setting: { Args: { setting_key: string }; Returns: Json }
      user_organizations: { Args: never; Returns: string[] }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
