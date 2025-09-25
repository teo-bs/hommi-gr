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
  public: {
    Tables: {
      amenities: {
        Row: {
          category: string
          created_at: string | null
          icon: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string | null
          icon: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string | null
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          match_score: number | null
          seeker_id: string
          status: string | null
          why_json: Json | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          match_score?: number | null
          seeker_id: string
          status?: string | null
          why_json?: Json | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          match_score?: number | null
          seeker_id?: string
          status?: string | null
          why_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holds: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          listing_id: string
          released_at: string | null
          seeker_id: string
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          listing_id: string
          released_at?: string | null
          seeker_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          listing_id?: string
          released_at?: string | null
          seeker_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holds_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          amenities_property: Json | null
          amenities_room: Json | null
          audience_preferences: Json | null
          availability_date: string | null
          availability_to: string | null
          bathrooms: number | null
          bed_type: string | null
          bedrooms_double: number | null
          bedrooms_single: number | null
          bills_note: string | null
          city: string
          couples_accepted: boolean | null
          created_at: string | null
          deposit: number | null
          deposit_required: boolean | null
          description: string | null
          door: string | null
          flatmates_count: number | null
          floor: number | null
          geo: Json | null
          has_lift: boolean | null
          house_rules: string[] | null
          i_live_here: boolean | null
          id: string
          is_location_approx: boolean | null
          lat: number | null
          listed_space: string | null
          lng: number | null
          max_stay_months: number | null
          min_stay_months: number | null
          neighborhood: string | null
          orientation: string | null
          owner_id: string
          pets_allowed: boolean | null
          photos: Json | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          preferred_gender: string[] | null
          preferred_situation: string[] | null
          price_month: number
          price_per_m2: number | null
          property_size_m2: number | null
          property_type: string | null
          publish_status:
            | Database["public"]["Enums"]["publish_status_enum"]
            | null
          publish_warnings: Json | null
          room_size_m2: number | null
          services: string[] | null
          smoking_allowed: boolean | null
          status: Database["public"]["Enums"]["publish_status_enum"]
          step_completed: number | null
          street_address: string | null
          title: string
          updated_at: string | null
          wc_count: number | null
        }
        Insert: {
          amenities_property?: Json | null
          amenities_room?: Json | null
          audience_preferences?: Json | null
          availability_date?: string | null
          availability_to?: string | null
          bathrooms?: number | null
          bed_type?: string | null
          bedrooms_double?: number | null
          bedrooms_single?: number | null
          bills_note?: string | null
          city: string
          couples_accepted?: boolean | null
          created_at?: string | null
          deposit?: number | null
          deposit_required?: boolean | null
          description?: string | null
          door?: string | null
          flatmates_count?: number | null
          floor?: number | null
          geo?: Json | null
          has_lift?: boolean | null
          house_rules?: string[] | null
          i_live_here?: boolean | null
          id?: string
          is_location_approx?: boolean | null
          lat?: number | null
          listed_space?: string | null
          lng?: number | null
          max_stay_months?: number | null
          min_stay_months?: number | null
          neighborhood?: string | null
          orientation?: string | null
          owner_id: string
          pets_allowed?: boolean | null
          photos?: Json | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_gender?: string[] | null
          preferred_situation?: string[] | null
          price_month: number
          price_per_m2?: number | null
          property_size_m2?: number | null
          property_type?: string | null
          publish_status?:
            | Database["public"]["Enums"]["publish_status_enum"]
            | null
          publish_warnings?: Json | null
          room_size_m2?: number | null
          services?: string[] | null
          smoking_allowed?: boolean | null
          status?: Database["public"]["Enums"]["publish_status_enum"]
          step_completed?: number | null
          street_address?: string | null
          title: string
          updated_at?: string | null
          wc_count?: number | null
        }
        Update: {
          amenities_property?: Json | null
          amenities_room?: Json | null
          audience_preferences?: Json | null
          availability_date?: string | null
          availability_to?: string | null
          bathrooms?: number | null
          bed_type?: string | null
          bedrooms_double?: number | null
          bedrooms_single?: number | null
          bills_note?: string | null
          city?: string
          couples_accepted?: boolean | null
          created_at?: string | null
          deposit?: number | null
          deposit_required?: boolean | null
          description?: string | null
          door?: string | null
          flatmates_count?: number | null
          floor?: number | null
          geo?: Json | null
          has_lift?: boolean | null
          house_rules?: string[] | null
          i_live_here?: boolean | null
          id?: string
          is_location_approx?: boolean | null
          lat?: number | null
          listed_space?: string | null
          lng?: number | null
          max_stay_months?: number | null
          min_stay_months?: number | null
          neighborhood?: string | null
          orientation?: string | null
          owner_id?: string
          pets_allowed?: boolean | null
          photos?: Json | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_gender?: string[] | null
          preferred_situation?: string[] | null
          price_month?: number
          price_per_m2?: number | null
          property_size_m2?: number | null
          property_type?: string | null
          publish_status?:
            | Database["public"]["Enums"]["publish_status_enum"]
            | null
          publish_warnings?: Json | null
          room_size_m2?: number | null
          services?: string[] | null
          smoking_allowed?: boolean | null
          status?: Database["public"]["Enums"]["publish_status_enum"]
          step_completed?: number | null
          street_address?: string | null
          title?: string
          updated_at?: string | null
          wc_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "threads"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          completed_steps: number[]
          current_step: number
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_steps?: number[]
          current_step?: number
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_steps?: number[]
          current_step?: number
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          can_switch_roles: boolean | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          email: string
          facebook_connected: boolean | null
          gender: Database["public"]["Enums"]["gender_enum"] | null
          google_connected: boolean | null
          id: string
          is_public: boolean | null
          kyc_status: string | null
          languages: string[] | null
          last_active: string | null
          lister_badges: Json | null
          lister_score: number | null
          marketing_opt_in: boolean | null
          member_since: string | null
          profession: string | null
          profile_completion_pct: number | null
          role: Database["public"]["Enums"]["user_role_enum"]
          social_instagram: string | null
          social_linkedin: string | null
          social_tiktok: string | null
          social_twitter_x: string | null
          terms_accepted_at: string | null
          updated_at: string | null
          user_id: string
          verifications_json: Json | null
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          can_switch_roles?: boolean | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          facebook_connected?: boolean | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          google_connected?: boolean | null
          id?: string
          is_public?: boolean | null
          kyc_status?: string | null
          languages?: string[] | null
          last_active?: string | null
          lister_badges?: Json | null
          lister_score?: number | null
          marketing_opt_in?: boolean | null
          member_since?: string | null
          profession?: string | null
          profile_completion_pct?: number | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_twitter_x?: string | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id: string
          verifications_json?: Json | null
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          can_switch_roles?: boolean | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          facebook_connected?: boolean | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          google_connected?: boolean | null
          id?: string
          is_public?: boolean | null
          kyc_status?: string | null
          languages?: string[] | null
          last_active?: string | null
          lister_badges?: Json | null
          lister_score?: number | null
          marketing_opt_in?: boolean | null
          member_since?: string | null
          profession?: string | null
          profile_completion_pct?: number | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          social_instagram?: string | null
          social_linkedin?: string | null
          social_tiktok?: string | null
          social_twitter_x?: string | null
          terms_accepted_at?: string | null
          updated_at?: string | null
          user_id?: string
          verifications_json?: Json | null
        }
        Relationships: []
      }
      references: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "references_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          body: string | null
          created_at: string | null
          id: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          id?: string
          rating: number
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      room_amenities: {
        Row: {
          amenity_id: string
          room_id: string
        }
        Insert: {
          amenity_id: string
          room_id: string
        }
        Update: {
          amenity_id?: string
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_room_amenities_amenity_id"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      room_photos: {
        Row: {
          alt_text: string | null
          created_at: string | null
          id: string
          room_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          room_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          id?: string
          room_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: []
      }
      room_stats: {
        Row: {
          created_at: string | null
          id: string
          last_viewed_at: string | null
          request_count: number | null
          room_id: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          request_count?: number | null
          room_id: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_viewed_at?: string | null
          request_count?: number | null
          room_id?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string | null
          has_bed: boolean | null
          id: string
          is_interior: boolean | null
          listing_id: string
          room_size_m2: number | null
          room_type: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          has_bed?: boolean | null
          id?: string
          is_interior?: boolean | null
          listing_id: string
          room_size_m2?: number | null
          room_type?: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          has_bed?: boolean | null
          id?: string
          is_interior?: boolean | null
          listing_id?: string
          room_size_m2?: number | null
          room_type?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      threads: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          host_id: string
          id: string
          listing_id: string
          seeker_id: string
          status: Database["public"]["Enums"]["thread_status_enum"] | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          host_id: string
          id?: string
          listing_id: string
          seeker_id: string
          status?: Database["public"]["Enums"]["thread_status_enum"] | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          host_id?: string
          id?: string
          listing_id?: string
          seeker_id?: string
          status?: Database["public"]["Enums"]["thread_status_enum"] | null
        }
        Relationships: [
          {
            foreignKeyName: "threads_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      verifications: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["verification_kind_enum"]
          status: Database["public"]["Enums"]["verification_status_enum"]
          user_id: string
          value: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["verification_kind_enum"]
          status?: Database["public"]["Enums"]["verification_status_enum"]
          user_id: string
          value?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["verification_kind_enum"]
          status?: Database["public"]["Enums"]["verification_status_enum"]
          user_id?: string
          value?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      viewings: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          proposed_date: string | null
          seeker_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          proposed_date?: string | null
          seeker_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          proposed_date?: string | null
          seeker_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_room_views: {
        Args: { rid: string }
        Returns: undefined
      }
      update_thread_status: {
        Args: {
          new_status: Database["public"]["Enums"]["thread_status_enum"]
          thread_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      gender_enum: "male" | "female" | "other" | "prefer_not_to_say"
      publish_status_enum: "draft" | "published"
      thread_status_enum:
        | "pending"
        | "accepted"
        | "declined"
        | "blocked"
        | "archived"
      user_role_enum: "tenant" | "lister"
      verification_kind_enum:
        | "email"
        | "phone"
        | "govgr"
        | "google"
        | "facebook"
      verification_status_enum: "unverified" | "pending" | "verified"
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
  public: {
    Enums: {
      gender_enum: ["male", "female", "other", "prefer_not_to_say"],
      publish_status_enum: ["draft", "published"],
      thread_status_enum: [
        "pending",
        "accepted",
        "declined",
        "blocked",
        "archived",
      ],
      user_role_enum: ["tenant", "lister"],
      verification_kind_enum: ["email", "phone", "govgr", "google", "facebook"],
      verification_status_enum: ["unverified", "pending", "verified"],
    },
  },
} as const
