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
      agency_leads: {
        Row: {
          company_name: string
          contact_name: string
          created_at: string
          email: string
          id: string
          message: string | null
          phone: string | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          company_name: string
          contact_name: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          contact_name?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      amenities: {
        Row: {
          category: string
          category_id: string | null
          created_at: string | null
          icon: string
          id: string
          is_active: boolean
          key: string
          name_el: string | null
          name_en: string | null
          sort_order: number
        }
        Insert: {
          category?: string
          category_id?: string | null
          created_at?: string | null
          icon: string
          id?: string
          is_active?: boolean
          key: string
          name_el?: string | null
          name_en?: string | null
          sort_order?: number
        }
        Update: {
          category?: string
          category_id?: string | null
          created_at?: string | null
          icon?: string
          id?: string
          is_active?: boolean
          key?: string
          name_el?: string | null
          name_en?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "amenities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "amenity_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      amenity_categories: {
        Row: {
          created_at: string
          id: string
          key: string
          name_el: string | null
          name_en: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          name_el?: string | null
          name_en: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          name_el?: string | null
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      applications: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          listing_id: string
          match_score: number | null
          room_id: string
          seeker_id: string
          status: string | null
          why_json: Json | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id: string
          match_score?: number | null
          room_id: string
          seeker_id: string
          status?: string | null
          why_json?: Json | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id?: string
          match_score?: number | null
          room_id?: string
          seeker_id?: string
          status?: string | null
          why_json?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "applications_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "applications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
        ]
      }
      broken_photos_log: {
        Row: {
          created_at: string | null
          detected_at: string | null
          id: string
          lister_id: string | null
          photo_url: string
          resolution_action: string | null
          resolved_at: string | null
          room_id: string | null
        }
        Insert: {
          created_at?: string | null
          detected_at?: string | null
          id?: string
          lister_id?: string | null
          photo_url: string
          resolution_action?: string | null
          resolved_at?: string | null
          room_id?: string | null
        }
        Update: {
          created_at?: string | null
          detected_at?: string | null
          id?: string
          lister_id?: string | null
          photo_url?: string
          resolution_action?: string | null
          resolved_at?: string | null
          room_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broken_photos_log_lister_id_fkey"
            columns: ["lister_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broken_photos_log_lister_id_fkey"
            columns: ["lister_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
          {
            foreignKeyName: "broken_photos_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "broken_photos_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broken_photos_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "broken_photos_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broken_photos_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "broken_photos_log_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
        ]
      }
      holds: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          id: string
          listing_id: string
          released_at: string | null
          room_id: string
          seeker_id: string
          status: string | null
          stripe_payment_intent_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          id?: string
          listing_id: string
          released_at?: string | null
          room_id: string
          seeker_id: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          id?: string
          listing_id?: string
          released_at?: string | null
          room_id?: string
          seeker_id?: string
          status?: string | null
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "holds_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "holds_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "holds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "holds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "holds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "holds_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "holds_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "holds_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
        ]
      }
      house_rule_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          key: string
          name_el: string | null
          name_en: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          key: string
          name_el?: string | null
          name_en: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          key?: string
          name_el?: string | null
          name_en?: string
          sort_order?: number
        }
        Relationships: []
      }
      listing_amenities: {
        Row: {
          amenity_id: string
          created_at: string
          listing_id: string
          scope: string | null
        }
        Insert: {
          amenity_id: string
          created_at?: string
          listing_id: string
          scope?: string | null
        }
        Update: {
          amenity_id?: string
          created_at?: string
          listing_id?: string
          scope?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "v_amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_amenities_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listing_house_rules: {
        Row: {
          created_at: string
          listing_id: string
          rule_id: string
        }
        Insert: {
          created_at?: string
          listing_id: string
          rule_id: string
        }
        Update: {
          created_at?: string
          listing_id?: string
          rule_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_house_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_house_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_house_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_house_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_house_rules_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_house_rules_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "house_rule_types"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_photos: {
        Row: {
          alt_text: string | null
          created_at: string
          deleted_at: string | null
          id: string
          is_cover: boolean
          listing_id: string
          sort_order: number
          updated_at: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_cover?: boolean
          listing_id: string
          sort_order?: number
          updated_at?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          is_cover?: boolean
          listing_id?: string
          sort_order?: number
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_photos_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      listings: {
        Row: {
          archived_at: string | null
          audience_preferences: Json | null
          availability_date: string | null
          availability_to: string | null
          bathrooms: number | null
          bed_type: string | null
          bedrooms_double: number | null
          bedrooms_single: number | null
          bills_included: boolean | null
          bills_note: string | null
          city: string
          country: string | null
          couples_accepted: boolean | null
          cover_photo_id: string | null
          created_at: string | null
          deleted_at: string | null
          deposit: number | null
          deposit_required: boolean | null
          description: string | null
          door: string | null
          flatmates_count: number | null
          floor: number | null
          formatted_address: string | null
          geo: Json | null
          geo_point: unknown | null
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
          postcode: string | null
          preferred_age_max: number | null
          preferred_age_min: number | null
          preferred_gender: string[] | null
          preferred_situation: string[] | null
          price_month: number
          price_per_m2: number | null
          property_size_m2: number | null
          property_type: string | null
          publish_warnings: Json | null
          published_at: string | null
          region: string | null
          required_verifications: string[] | null
          room_size_m2: number | null
          search_tsv: unknown | null
          services: string[] | null
          slug: string | null
          smoking_allowed: boolean | null
          status: Database["public"]["Enums"]["publish_status_enum"]
          step_completed: number | null
          street: string | null
          street_address: string | null
          street_number: string | null
          title: string
          updated_at: string
          wc_count: number | null
        }
        Insert: {
          archived_at?: string | null
          audience_preferences?: Json | null
          availability_date?: string | null
          availability_to?: string | null
          bathrooms?: number | null
          bed_type?: string | null
          bedrooms_double?: number | null
          bedrooms_single?: number | null
          bills_included?: boolean | null
          bills_note?: string | null
          city: string
          country?: string | null
          couples_accepted?: boolean | null
          cover_photo_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deposit?: number | null
          deposit_required?: boolean | null
          description?: string | null
          door?: string | null
          flatmates_count?: number | null
          floor?: number | null
          formatted_address?: string | null
          geo?: Json | null
          geo_point?: unknown | null
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
          postcode?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_gender?: string[] | null
          preferred_situation?: string[] | null
          price_month: number
          price_per_m2?: number | null
          property_size_m2?: number | null
          property_type?: string | null
          publish_warnings?: Json | null
          published_at?: string | null
          region?: string | null
          required_verifications?: string[] | null
          room_size_m2?: number | null
          search_tsv?: unknown | null
          services?: string[] | null
          slug?: string | null
          smoking_allowed?: boolean | null
          status?: Database["public"]["Enums"]["publish_status_enum"]
          step_completed?: number | null
          street?: string | null
          street_address?: string | null
          street_number?: string | null
          title: string
          updated_at?: string
          wc_count?: number | null
        }
        Update: {
          archived_at?: string | null
          audience_preferences?: Json | null
          availability_date?: string | null
          availability_to?: string | null
          bathrooms?: number | null
          bed_type?: string | null
          bedrooms_double?: number | null
          bedrooms_single?: number | null
          bills_included?: boolean | null
          bills_note?: string | null
          city?: string
          country?: string | null
          couples_accepted?: boolean | null
          cover_photo_id?: string | null
          created_at?: string | null
          deleted_at?: string | null
          deposit?: number | null
          deposit_required?: boolean | null
          description?: string | null
          door?: string | null
          flatmates_count?: number | null
          floor?: number | null
          formatted_address?: string | null
          geo?: Json | null
          geo_point?: unknown | null
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
          postcode?: string | null
          preferred_age_max?: number | null
          preferred_age_min?: number | null
          preferred_gender?: string[] | null
          preferred_situation?: string[] | null
          price_month?: number
          price_per_m2?: number | null
          property_size_m2?: number | null
          property_type?: string | null
          publish_warnings?: Json | null
          published_at?: string | null
          region?: string | null
          required_verifications?: string[] | null
          room_size_m2?: number | null
          search_tsv?: unknown | null
          services?: string[] | null
          slug?: string | null
          smoking_allowed?: boolean | null
          status?: Database["public"]["Enums"]["publish_status_enum"]
          step_completed?: number | null
          street?: string | null
          street_address?: string | null
          street_number?: string | null
          title?: string
          updated_at?: string
          wc_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "listings_cover_photo_id_fkey"
            columns: ["cover_photo_id"]
            isOneToOne: false
            referencedRelation: "listing_photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          deleted_at: string | null
          id: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          body: string
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          sender_id: string
          thread_id: string
        }
        Update: {
          body?: string
          created_at?: string | null
          deleted_at?: string | null
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
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
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
      photo_health_check_status: {
        Row: {
          broken_found: number | null
          created_at: string | null
          id: string
          last_run_at: string | null
          photos_checked: number | null
          run_duration_ms: number | null
        }
        Insert: {
          broken_found?: number | null
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          photos_checked?: number | null
          run_duration_ms?: number | null
        }
        Update: {
          broken_found?: number | null
          created_at?: string | null
          id?: string
          last_run_at?: string | null
          photos_checked?: number | null
          run_duration_ms?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          about_me: string | null
          account_status: Database["public"]["Enums"]["account_status_enum"]
          avatar_url: string | null
          can_switch_roles: boolean | null
          country: string | null
          created_at: string | null
          date_of_birth: string | null
          display_name: string | null
          email: string
          facebook_connected: boolean | null
          first_name: string | null
          gender: Database["public"]["Enums"]["gender_enum"] | null
          google_connected: boolean | null
          id: string
          is_public: boolean | null
          kyc_status: string | null
          languages: string[] | null
          last_active: string | null
          last_name: string | null
          lister_badges: Json | null
          lister_score: number | null
          lister_type: Database["public"]["Enums"]["lister_type_enum"] | null
          marketing_opt_in: boolean | null
          member_since: string | null
          profession: string | null
          profile_completion_pct: number | null
          profile_extras: Json
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
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          avatar_url?: string | null
          can_switch_roles?: boolean | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email: string
          facebook_connected?: boolean | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          google_connected?: boolean | null
          id?: string
          is_public?: boolean | null
          kyc_status?: string | null
          languages?: string[] | null
          last_active?: string | null
          last_name?: string | null
          lister_badges?: Json | null
          lister_score?: number | null
          lister_type?: Database["public"]["Enums"]["lister_type_enum"] | null
          marketing_opt_in?: boolean | null
          member_since?: string | null
          profession?: string | null
          profile_completion_pct?: number | null
          profile_extras?: Json
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
          account_status?: Database["public"]["Enums"]["account_status_enum"]
          avatar_url?: string | null
          can_switch_roles?: boolean | null
          country?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          display_name?: string | null
          email?: string
          facebook_connected?: boolean | null
          first_name?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"] | null
          google_connected?: boolean | null
          id?: string
          is_public?: boolean | null
          kyc_status?: string | null
          languages?: string[] | null
          last_active?: string | null
          last_name?: string | null
          lister_badges?: Json | null
          lister_score?: number | null
          lister_type?: Database["public"]["Enums"]["lister_type_enum"] | null
          marketing_opt_in?: boolean | null
          member_since?: string | null
          profession?: string | null
          profile_completion_pct?: number | null
          profile_extras?: Json
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
          {
            foreignKeyName: "references_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
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
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
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
            foreignKeyName: "fk_room_amenities_amenity_id"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "v_amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "fk_room_amenities_room_id"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
        ]
      }
      room_photos: {
        Row: {
          alt_text: string | null
          created_at: string | null
          deleted_at: string | null
          id: string
          is_cover: boolean | null
          large_url: string | null
          medium_url: string | null
          room_id: string
          sort_order: number | null
          thumbnail_url: string | null
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_cover?: boolean | null
          large_url?: string | null
          medium_url?: string | null
          room_id: string
          sort_order?: number | null
          thumbnail_url?: string | null
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          is_cover?: boolean | null
          large_url?: string | null
          medium_url?: string | null
          room_id?: string
          sort_order?: number | null
          thumbnail_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_photos_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "room_stats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_stats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_stats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_stats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "room_stats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "room_stats_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: true
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
        ]
      }
      rooms: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          has_bed: boolean | null
          id: string
          is_interior: boolean | null
          listing_id: string
          price_month: number | null
          room_size_m2: number | null
          room_type: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          has_bed?: boolean | null
          id?: string
          is_interior?: boolean | null
          listing_id: string
          price_month?: number | null
          room_size_m2?: number | null
          room_type?: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          has_bed?: boolean | null
          id?: string
          is_interior?: boolean | null
          listing_id?: string
          price_month?: number | null
          room_size_m2?: number | null
          room_type?: string
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      saved_rooms: {
        Row: {
          created_at: string
          deleted_at: string | null
          id: string
          room_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          room_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          id?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "saved_rooms_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
        ]
      }
      threads: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          declined_at: string | null
          deleted_at: string | null
          host_id: string
          id: string
          last_message_at: string | null
          listing_id: string
          room_id: string
          seeker_id: string
          status: Database["public"]["Enums"]["thread_status_enum"] | null
          unread_count_host: number | null
          unread_count_seeker: number | null
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          deleted_at?: string | null
          host_id: string
          id?: string
          last_message_at?: string | null
          listing_id: string
          room_id: string
          seeker_id: string
          status?: Database["public"]["Enums"]["thread_status_enum"] | null
          unread_count_host?: number | null
          unread_count_seeker?: number | null
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          declined_at?: string | null
          deleted_at?: string | null
          host_id?: string
          id?: string
          last_message_at?: string | null
          listing_id?: string
          room_id?: string
          seeker_id?: string
          status?: Database["public"]["Enums"]["thread_status_enum"] | null
          unread_count_host?: number | null
          unread_count_seeker?: number | null
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
            foreignKeyName: "threads_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
          {
            foreignKeyName: "threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
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
            foreignKeyName: "threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "threads_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "threads_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "threads_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_otps: {
        Row: {
          attempts: number | null
          code: string
          created_at: string | null
          expires_at: string
          id: string
          phone: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          attempts?: number | null
          code: string
          created_at?: string | null
          expires_at: string
          id?: string
          phone: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          attempts?: number | null
          code?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          phone?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      verifications: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["verification_kind_enum"]
          metadata: Json | null
          status: Database["public"]["Enums"]["verification_status_enum"]
          updated_at: string | null
          user_id: string
          value: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["verification_kind_enum"]
          metadata?: Json | null
          status?: Database["public"]["Enums"]["verification_status_enum"]
          updated_at?: string | null
          user_id: string
          value?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["verification_kind_enum"]
          metadata?: Json | null
          status?: Database["public"]["Enums"]["verification_status_enum"]
          updated_at?: string | null
          user_id?: string
          value?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      viewings: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          id: string
          listing_id: string
          proposed_date: string | null
          room_id: string
          seeker_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id: string
          proposed_date?: string | null
          room_id: string
          seeker_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          id?: string
          listing_id?: string
          proposed_date?: string | null
          room_id?: string
          seeker_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "viewings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "mv_room_amenity_facets"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "viewings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "viewings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_amenities_grouped"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "viewings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["room_id"]
          },
          {
            foreignKeyName: "viewings_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewings_seeker_id_fkey"
            columns: ["seeker_id"]
            isOneToOne: false
            referencedRelation: "room_search_cache"
            referencedColumns: ["lister_profile_id"]
          },
        ]
      }
    }
    Views: {
      listing_card_view: {
        Row: {
          city: string | null
          cover_url: string | null
          id: string | null
          price_month: number | null
          slug: string | null
          status: Database["public"]["Enums"]["publish_status_enum"] | null
          title: string | null
        }
        Insert: {
          city?: string | null
          cover_url?: never
          id?: string | null
          price_month?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["publish_status_enum"] | null
          title?: string | null
        }
        Update: {
          city?: string | null
          cover_url?: never
          id?: string | null
          price_month?: number | null
          slug?: string | null
          status?: Database["public"]["Enums"]["publish_status_enum"] | null
          title?: string | null
        }
        Relationships: []
      }
      mv_listing_amenity_facets: {
        Row: {
          amenity_keys: string[] | null
          listing_id: string | null
        }
        Relationships: []
      }
      mv_room_amenity_facets: {
        Row: {
          amenity_keys: string[] | null
          room_id: string | null
        }
        Relationships: []
      }
      room_card_view: {
        Row: {
          cover_url: string | null
          id: string | null
          listing_id: string | null
          price_month: number | null
          slug: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listing_card_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "room_search_cache"
            referencedColumns: ["listing_id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "v_listing_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_rooms_listing_id"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "v_room_detail_by_slug"
            referencedColumns: ["listing_id"]
          },
        ]
      }
      room_search_cache: {
        Row: {
          amenity_keys: string[] | null
          audience_preferences: Json | null
          availability_date: string | null
          availability_to: string | null
          bills_included: boolean | null
          city: string | null
          couples_accepted: boolean | null
          cover_photo_url: string | null
          flatmates_count: number | null
          formatted_address: string | null
          kyc_status: string | null
          lat: number | null
          lister_avatar_url: string | null
          lister_first_name: string | null
          lister_profile_extras: Json | null
          lister_profile_id: string | null
          lister_score: number | null
          lister_type: Database["public"]["Enums"]["lister_type_enum"] | null
          listing_created_at: string | null
          listing_id: string | null
          lng: number | null
          max_stay_months: number | null
          min_stay_months: number | null
          neighborhood: string | null
          pets_allowed: boolean | null
          price_month: number | null
          published_at: string | null
          room_id: string | null
          room_type: string | null
          slug: string | null
          smoking_allowed: boolean | null
          title: string | null
          verifications_json: Json | null
        }
        Relationships: []
      }
      v_amenities: {
        Row: {
          category_id: string | null
          created_at: string | null
          icon: string | null
          id: string | null
          is_active: boolean | null
          key: string | null
          name: string | null
          name_el: string | null
          name_en: string | null
          sort_order: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          key?: string | null
          name?: never
          name_el?: string | null
          name_en?: string | null
          sort_order?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string | null
          is_active?: boolean | null
          key?: string | null
          name?: never
          name_el?: string | null
          name_en?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "amenities_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "amenity_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      v_listing_amenities_grouped: {
        Row: {
          category_key: string | null
          category_name: string | null
          items: Json | null
          listing_id: string | null
        }
        Relationships: []
      }
      v_listing_cards: {
        Row: {
          amenity_keys: string[] | null
          availability_date: string | null
          city: string | null
          id: string | null
          lat: number | null
          lng: number | null
          neighborhood: string | null
          price_month: number | null
          primary_photo: string | null
          title: string | null
        }
        Insert: {
          amenity_keys?: never
          availability_date?: string | null
          city?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          price_month?: number | null
          primary_photo?: never
          title?: string | null
        }
        Update: {
          amenity_keys?: never
          availability_date?: string | null
          city?: string | null
          id?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string | null
          price_month?: number | null
          primary_photo?: never
          title?: string | null
        }
        Relationships: []
      }
      v_room_amenities_grouped: {
        Row: {
          category_key: string | null
          category_name: string | null
          items: Json | null
          room_id: string | null
        }
        Relationships: []
      }
      v_room_detail_by_slug: {
        Row: {
          availability_date: string | null
          bathrooms: number | null
          bed_type: string | null
          bedrooms_double: number | null
          bedrooms_single: number | null
          city: string | null
          description: string | null
          door: string | null
          floor: number | null
          has_bed: boolean | null
          has_lift: boolean | null
          is_interior: boolean | null
          is_location_approx: boolean | null
          lat: number | null
          listing_amenity_keys: string[] | null
          listing_id: string | null
          lng: number | null
          neighborhood: string | null
          orientation: string | null
          price_month: number | null
          primary_photo: string | null
          room_amenity_keys: string[] | null
          room_id: string | null
          room_photos: Json | null
          room_size_m2: number | null
          room_type: string | null
          slug: string | null
          street_address: string | null
          title: string | null
          wc_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      current_profile_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      ensure_unique_listing_slug: {
        Args: { p_base: string; p_id: string }
        Returns: string
      }
      ensure_unique_room_slug: {
        Args: { p_base: string; p_id: string }
        Returns: string
      }
      generate_greek_safe_slug: {
        Args: { input_text: string; p_listing_id?: string }
        Returns: string
      }
      generate_room_slug: {
        Args: { _listing_id: string; _suffix?: string }
        Returns: string
      }
      get_listing_amenities_grouped: {
        Args: { p_listing_id: string; p_locale?: string }
        Returns: {
          category_key: string
          category_name: string
          items: Json
        }[]
      }
      get_room_amenities_grouped: {
        Args: { p_locale?: string; p_room_id: string }
        Returns: {
          category_key: string
          category_name: string
          items: Json
        }[]
      }
      get_user_saved_rooms_count: {
        Args: { user_uuid: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_room_views: {
        Args: { rid: string }
        Returns: undefined
      }
      is_lister_with_published: {
        Args: { profile_id: string }
        Returns: boolean
      }
      is_room_saved_by_user: {
        Args: { room_uuid: string; user_uuid: string }
        Returns: boolean
      }
      publish_listing_atomic: {
        Args:
          | { p_listing_id: string }
          | { p_listing_id: string; p_room_slug?: string }
        Returns: Json
      }
      refresh_listing_amenity_facets: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      refresh_room_search_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reset_unread_count: {
        Args: { p_thread_id: string; p_user_role: string }
        Returns: undefined
      }
      set_listing_amenities_by_keys: {
        Args: { p_keys: string[]; p_listing_id: string; p_scope?: string }
        Returns: undefined
      }
      set_room_amenities_by_keys: {
        Args: { p_keys: string[]; p_room_id: string }
        Returns: undefined
      }
      slugify: {
        Args: { input: string }
        Returns: string
      }
      unaccent: {
        Args: { "": string }
        Returns: string
      }
      unaccent_init: {
        Args: { "": unknown }
        Returns: unknown
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
      account_status_enum: "active" | "pending_qualification" | "suspended"
      app_role: "admin" | "user"
      gender_enum: "male" | "female" | "other" | "prefer_not_to_say"
      lister_type_enum: "individual" | "agency"
      publish_status_enum: "draft" | "published" | "archived" | "publishing"
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
      account_status_enum: ["active", "pending_qualification", "suspended"],
      app_role: ["admin", "user"],
      gender_enum: ["male", "female", "other", "prefer_not_to_say"],
      lister_type_enum: ["individual", "agency"],
      publish_status_enum: ["draft", "published", "archived", "publishing"],
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
