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
          availability_date: string | null
          bills_note: string | null
          city: string
          couples_accepted: boolean | null
          created_at: string | null
          flatmates_count: number | null
          geo: Json | null
          id: string
          listed_space: string | null
          neighborhood: string | null
          owner_id: string
          pets_allowed: boolean | null
          photos: Json | null
          price_month: number
          smoking_allowed: boolean | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          amenities_property?: Json | null
          amenities_room?: Json | null
          availability_date?: string | null
          bills_note?: string | null
          city: string
          couples_accepted?: boolean | null
          created_at?: string | null
          flatmates_count?: number | null
          geo?: Json | null
          id?: string
          listed_space?: string | null
          neighborhood?: string | null
          owner_id: string
          pets_allowed?: boolean | null
          photos?: Json | null
          price_month: number
          smoking_allowed?: boolean | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          amenities_property?: Json | null
          amenities_room?: Json | null
          availability_date?: string | null
          bills_note?: string | null
          city?: string
          couples_accepted?: boolean | null
          created_at?: string | null
          flatmates_count?: number | null
          geo?: Json | null
          id?: string
          listed_space?: string | null
          neighborhood?: string | null
          owner_id?: string
          pets_allowed?: boolean | null
          photos?: Json | null
          price_month?: number
          smoking_allowed?: boolean | null
          status?: string | null
          title?: string
          updated_at?: string | null
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
      profiles: {
        Row: {
          avatar_url: string | null
          can_switch_roles: boolean | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          kyc_status: string | null
          languages: string[] | null
          last_active: string | null
          member_since: string | null
          profession: string | null
          role: string
          updated_at: string | null
          user_id: string
          verifications_json: Json | null
        }
        Insert: {
          avatar_url?: string | null
          can_switch_roles?: boolean | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id?: string
          kyc_status?: string | null
          languages?: string[] | null
          last_active?: string | null
          member_since?: string | null
          profession?: string | null
          role?: string
          updated_at?: string | null
          user_id: string
          verifications_json?: Json | null
        }
        Update: {
          avatar_url?: string | null
          can_switch_roles?: boolean | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          kyc_status?: string | null
          languages?: string[] | null
          last_active?: string | null
          member_since?: string | null
          profession?: string | null
          role?: string
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
      threads: {
        Row: {
          created_at: string | null
          host_id: string
          id: string
          listing_id: string
          seeker_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          host_id: string
          id?: string
          listing_id: string
          seeker_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          host_id?: string
          id?: string
          listing_id?: string
          seeker_id?: string
          status?: string | null
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
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
