export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_path: string | null;
          bio: string | null;
          preferred_locale: 'en' | 'bn';
          city: string | null;
          area_label: string | null;
          account_status: 'active' | 'suspended' | 'deactivated';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_path?: string | null;
          bio?: string | null;
          preferred_locale?: 'en' | 'bn';
          city?: string | null;
          area_label?: string | null;
          account_status?: 'active' | 'suspended' | 'deactivated';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          display_name?: string;
          avatar_path?: string | null;
          bio?: string | null;
          preferred_locale?: 'en' | 'bn';
          city?: string | null;
          area_label?: string | null;
          account_status?: 'active' | 'suspended' | 'deactivated';
          created_at?: string;
          updated_at?: string;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
          created_at: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
          created_at?: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
          created_at?: string;
        };
      };
      user_role_assignments: {
        Row: {
          id: string;
          user_id: string;
          role_id: string;
          granted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role_id: string;
          granted_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role_id?: string;
          granted_by?: string | null;
          created_at?: string;
        };
      };
      species: {
        Row: {
          id: string;
          name: string;
          slug: string;
          is_domestic: boolean;
          is_active: boolean;
          jurisdiction_notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          is_domestic?: boolean;
          is_active?: boolean;
          jurisdiction_notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          is_domestic?: boolean;
          is_active?: boolean;
          jurisdiction_notes?: string | null;
          created_at?: string;
        };
      };
      breeds: {
        Row: {
          id: string;
          species_id: string;
          name: string;
          slug: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          species_id: string;
          name: string;
          slug: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          species_id?: string;
          name?: string;
          slug?: string;
          created_at?: string;
        };
      };
      animals: {
        Row: {
          id: string;
          owner_id: string;
          species_id: string;
          breed_id: string | null;
          name: string;
          sex: 'male' | 'female' | 'unknown' | null;
          date_of_birth: string | null;
          approximate_age_months: number | null;
          color_description: string | null;
          size_category: 'tiny' | 'small' | 'medium' | 'large' | 'extra_large' | null;
          temperament_tags: string[] | null;
          bio: string | null;
          visibility: 'public' | 'private';
          animal_status: 'active' | 'lost' | 'found' | 'adopted' | 'deceased';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          species_id: string;
          breed_id?: string | null;
          name: string;
          sex?: 'male' | 'female' | 'unknown' | null;
          date_of_birth?: string | null;
          approximate_age_months?: number | null;
          color_description?: string | null;
          size_category?: 'tiny' | 'small' | 'medium' | 'large' | 'extra_large' | null;
          temperament_tags?: string[] | null;
          bio?: string | null;
          visibility?: 'public' | 'private';
          animal_status?: 'active' | 'lost' | 'found' | 'adopted' | 'deceased';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          species_id?: string;
          breed_id?: string | null;
          name?: string;
          sex?: 'male' | 'female' | 'unknown' | null;
          date_of_birth?: string | null;
          approximate_age_months?: number | null;
          color_description?: string | null;
          size_category?: 'tiny' | 'small' | 'medium' | 'large' | 'extra_large' | null;
          temperament_tags?: string[] | null;
          bio?: string | null;
          visibility?: 'public' | 'private';
          animal_status?: 'active' | 'lost' | 'found' | 'adopted' | 'deceased';
          created_at?: string;
          updated_at?: string;
        };
      };
      animal_media: {
        Row: {
          id: string;
          animal_id: string;
          uploaded_by: string;
          storage_path: string;
          media_type: 'image' | 'video';
          alt_text: string | null;
          is_primary: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          uploaded_by: string;
          storage_path: string;
          media_type?: 'image' | 'video';
          alt_text?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          uploaded_by?: string;
          storage_path?: string;
          media_type?: 'image' | 'video';
          alt_text?: string | null;
          is_primary?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      animal_health_records: {
        Row: {
          id: string;
          animal_id: string;
          recorded_by: string;
          provider_name: string | null;
          record_type: 'checkup' | 'surgery' | 'diagnosis' | 'test' | 'other';
          title: string;
          notes: string | null;
          occurred_at: string;
          document_path: string | null;
          visibility: 'private' | 'owner_only';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          recorded_by: string;
          provider_name?: string | null;
          record_type: 'checkup' | 'surgery' | 'diagnosis' | 'test' | 'other';
          title: string;
          notes?: string | null;
          occurred_at: string;
          document_path?: string | null;
          visibility?: 'private' | 'owner_only';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          recorded_by?: string;
          provider_name?: string | null;
          record_type?: 'checkup' | 'surgery' | 'diagnosis' | 'test' | 'other';
          title?: string;
          notes?: string | null;
          occurred_at?: string;
          document_path?: string | null;
          visibility?: 'private' | 'owner_only';
          created_at?: string;
          updated_at?: string;
        };
      };
      vaccinations: {
        Row: {
          id: string;
          animal_id: string;
          recorded_by: string;
          provider_name: string | null;
          vaccine_name: string;
          administered_date: string;
          next_due_date: string | null;
          batch_number: string | null;
          notes: string | null;
          document_path: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          recorded_by: string;
          provider_name?: string | null;
          vaccine_name: string;
          administered_date: string;
          next_due_date?: string | null;
          batch_number?: string | null;
          notes?: string | null;
          document_path?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          recorded_by?: string;
          provider_name?: string | null;
          vaccine_name?: string;
          administered_date?: string;
          next_due_date?: string | null;
          batch_number?: string | null;
          notes?: string | null;
          document_path?: string | null;
          created_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          animal_id: string;
          recorded_by: string;
          medication_name: string;
          dosage_description: string | null;
          frequency: string | null;
          start_date: string | null;
          end_date: string | null;
          prescribing_provider_name: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          recorded_by: string;
          medication_name: string;
          dosage_description?: string | null;
          frequency?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          prescribing_provider_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          recorded_by?: string;
          medication_name?: string;
          dosage_description?: string | null;
          frequency?: string | null;
          start_date?: string | null;
          end_date?: string | null;
          prescribing_provider_name?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      care_reminders: {
        Row: {
          id: string;
          animal_id: string;
          created_by: string;
          reminder_type: 'vaccination' | 'medication' | 'checkup' | 'grooming' | 'other';
          title: string;
          due_date: string;
          is_recurring: boolean;
          recurrence_interval_days: number | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          created_by: string;
          reminder_type: 'vaccination' | 'medication' | 'checkup' | 'grooming' | 'other';
          title: string;
          due_date: string;
          is_recurring?: boolean;
          recurrence_interval_days?: number | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          created_by?: string;
          reminder_type?: 'vaccination' | 'medication' | 'checkup' | 'grooming' | 'other';
          title?: string;
          due_date?: string;
          is_recurring?: boolean;
          recurrence_interval_days?: number | null;
          is_completed?: boolean;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          author_id: string;
          organization_id: string | null;
          body: string | null;
          post_type: 'text' | 'media' | 'link' | 'care_tip';
          visibility: 'public' | 'followers' | 'group_only';
          is_published: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          organization_id?: string | null;
          body?: string | null;
          post_type?: 'text' | 'media' | 'link' | 'care_tip';
          visibility?: 'public' | 'followers' | 'group_only';
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          author_id?: string;
          organization_id?: string | null;
          body?: string | null;
          post_type?: 'text' | 'media' | 'link' | 'care_tip';
          visibility?: 'public' | 'followers' | 'group_only';
          is_published?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          storage_path: string;
          media_type: 'image' | 'video';
          alt_text: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          storage_path: string;
          media_type?: 'image' | 'video';
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          storage_path?: string;
          media_type?: 'image' | 'video';
          alt_text?: string | null;
          sort_order?: number;
          created_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          body: string;
          is_visible: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          body: string;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          parent_comment_id?: string | null;
          body?: string;
          is_visible?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      reactions: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction_type: 'like' | 'love' | 'support' | 'celebrate';
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          reaction_type?: 'like' | 'love' | 'support' | 'celebrate';
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          reaction_type?: 'like' | 'love' | 'support' | 'celebrate';
          created_at?: string;
        };
      };
      hashtags: {
        Row: {
          id: string;
          tag: string;
          post_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          tag: string;
          post_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          tag?: string;
          post_count?: number;
          created_at?: string;
        };
      };
      post_hashtags: {
        Row: {
          post_id: string;
          hashtag_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          hashtag_id: string;
          created_at?: string;
        };
        Update: {
          post_id?: string;
          hashtag_id?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          follower_id: string;
          followed_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          followed_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          followed_id?: string;
          created_at?: string;
        };
      };
      groups: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          group_type: 'public' | 'private' | 'organization';
          organization_id: string | null;
          created_by: string;
          member_count: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          group_type?: 'public' | 'private' | 'organization';
          organization_id?: string | null;
          created_by: string;
          member_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          group_type?: 'public' | 'private' | 'organization';
          organization_id?: string | null;
          created_by?: string;
          member_count?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      group_members: {
        Row: {
          id: string;
          group_id: string;
          user_id: string;
          group_role: 'owner' | 'admin' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          group_id: string;
          user_id: string;
          group_role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
        Update: {
          id?: string;
          group_id?: string;
          user_id?: string;
          group_role?: 'owner' | 'admin' | 'member';
          joined_at?: string;
        };
      };
      group_posts: {
        Row: {
          group_id: string;
          post_id: string;
          added_by: string;
          created_at: string;
        };
        Insert: {
          group_id: string;
          post_id: string;
          added_by: string;
          created_at?: string;
        };
        Update: {
          group_id?: string;
          post_id?: string;
          added_by?: string;
          created_at?: string;
        };
      };
      content_reports: {
        Row: {
          id: string;
          reporter_id: string;
          reason: 'spam' | 'harassment' | 'misinformation' | 'animal_cruelty' | 'illegal_trade' | 'other';
          details: string | null;
          post_id: string | null;
          comment_id: string | null;
          profile_id: string | null;
          listing_id: string | null;
          rescue_case_id: string | null;
          lost_found_post_id: string | null;
          report_status: 'pending' | 'under_review' | 'resolved' | 'dismissed';
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reason: 'spam' | 'harassment' | 'misinformation' | 'animal_cruelty' | 'illegal_trade' | 'other';
          details?: string | null;
          post_id?: string | null;
          comment_id?: string | null;
          profile_id?: string | null;
          listing_id?: string | null;
          rescue_case_id?: string | null;
          lost_found_post_id?: string | null;
          report_status?: 'pending' | 'under_review' | 'resolved' | 'dismissed';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reason?: 'spam' | 'harassment' | 'misinformation' | 'animal_cruelty' | 'illegal_trade' | 'other';
          details?: string | null;
          post_id?: string | null;
          comment_id?: string | null;
          profile_id?: string | null;
          listing_id?: string | null;
          rescue_case_id?: string | null;
          lost_found_post_id?: string | null;
          report_status?: 'pending' | 'under_review' | 'resolved' | 'dismissed';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
      };
      adoption_listings: {
        Row: {
          id: string;
          animal_id: string;
          listed_by: string;
          organization_id: string | null;
          listing_status: 'draft' | 'active' | 'paused' | 'closed' | 'adopted';
          description: string | null;
          adoption_requirements: string | null;
          fee_description: string | null;
          listed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          animal_id: string;
          listed_by: string;
          organization_id?: string | null;
          listing_status?: 'draft' | 'active' | 'paused' | 'closed' | 'adopted';
          description?: string | null;
          adoption_requirements?: string | null;
          fee_description?: string | null;
          listed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          animal_id?: string;
          listed_by?: string;
          organization_id?: string | null;
          listing_status?: 'draft' | 'active' | 'paused' | 'closed' | 'adopted';
          description?: string | null;
          adoption_requirements?: string | null;
          fee_description?: string | null;
          listed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      adoption_applications: {
        Row: {
          id: string;
          listing_id: string;
          applicant_id: string;
          application_status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
          answers: Json | null;
          submitted_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          applicant_id: string;
          application_status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
          answers?: Json | null;
          submitted_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          applicant_id?: string;
          application_status?: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'withdrawn';
          answers?: Json | null;
          submitted_at?: string;
          updated_at?: string;
        };
      };
      adoption_status_history: {
        Row: {
          id: string;
          application_id: string;
          from_status: string | null;
          to_status: string;
          changed_by: string;
          notes: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          from_status?: string | null;
          to_status: string;
          changed_by: string;
          notes?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          from_status?: string | null;
          to_status?: string;
          changed_by?: string;
          notes?: string | null;
          changed_at?: string;
        };
      };
      lost_found_posts: {
        Row: {
          id: string;
          reporter_id: string;
          animal_id: string | null;
          report_type: 'lost' | 'found';
          species_id: string;
          description: string;
          last_seen_area_label: string | null;
          last_seen_location: unknown | null;
          incident_date: string;
          status: 'active' | 'resolved' | 'expired';
          resolved_by: string | null;
          resolved_at: string | null;
          media_paths: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          animal_id?: string | null;
          report_type: 'lost' | 'found';
          species_id: string;
          description: string;
          last_seen_area_label?: string | null;
          last_seen_location?: unknown | null;
          incident_date: string;
          status?: 'active' | 'resolved' | 'expired';
          resolved_by?: string | null;
          resolved_at?: string | null;
          media_paths?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          animal_id?: string | null;
          report_type?: 'lost' | 'found';
          species_id?: string;
          description?: string;
          last_seen_area_label?: string | null;
          last_seen_location?: unknown | null;
          incident_date?: string;
          status?: 'active' | 'resolved' | 'expired';
          resolved_by?: string | null;
          resolved_at?: string | null;
          media_paths?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      lost_found_sightings: {
        Row: {
          id: string;
          lost_found_post_id: string;
          reported_by: string;
          sighting_area_label: string | null;
          sighting_location: unknown | null;
          sighting_date: string;
          notes: string | null;
          media_paths: string[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lost_found_post_id: string;
          reported_by: string;
          sighting_area_label?: string | null;
          sighting_location?: unknown | null;
          sighting_date: string;
          notes?: string | null;
          media_paths?: string[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lost_found_post_id?: string;
          reported_by?: string;
          sighting_area_label?: string | null;
          sighting_location?: unknown | null;
          sighting_date?: string;
          notes?: string | null;
          media_paths?: string[] | null;
          created_at?: string;
        };
      };
      lost_found_matches: {
        Row: {
          id: string;
          lost_post_id: string;
          found_post_id: string;
          ai_match_candidate_id: string | null;
          match_status: 'ai_suggested' | 'user_reported' | 'confirmed' | 'rejected';
          confirmed_by: string | null;
          confirmed_at: string | null;
          confidence_score: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          lost_post_id: string;
          found_post_id: string;
          ai_match_candidate_id?: string | null;
          match_status?: 'ai_suggested' | 'user_reported' | 'confirmed' | 'rejected';
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          confidence_score?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          lost_post_id?: string;
          found_post_id?: string;
          ai_match_candidate_id?: string | null;
          match_status?: 'ai_suggested' | 'user_reported' | 'confirmed' | 'rejected';
          confirmed_by?: string | null;
          confirmed_at?: string | null;
          confidence_score?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      rescue_cases: {
        Row: {
          id: string;
          reported_by: string;
          organization_id: string | null;
          species_id: string;
          description: string;
          location_area_label: string | null;
          location: unknown | null;
          case_status: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
          urgency: 'low' | 'medium' | 'high' | 'critical';
          is_wildlife: boolean;
          media_paths: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reported_by: string;
          organization_id?: string | null;
          species_id: string;
          description: string;
          location_area_label?: string | null;
          location?: unknown | null;
          case_status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
          urgency?: 'low' | 'medium' | 'high' | 'critical';
          is_wildlife?: boolean;
          media_paths?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reported_by?: string;
          organization_id?: string | null;
          species_id?: string;
          description?: string;
          location_area_label?: string | null;
          location?: unknown | null;
          case_status?: 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
          urgency?: 'low' | 'medium' | 'high' | 'critical';
          is_wildlife?: boolean;
          media_paths?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      rescue_assignments: {
        Row: {
          id: string;
          rescue_case_id: string;
          assigned_to: string;
          assigned_by: string;
          assignment_status: 'active' | 'completed' | 'declined' | 'reassigned';
          notes: string | null;
          assigned_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          rescue_case_id: string;
          assigned_to: string;
          assigned_by: string;
          assignment_status?: 'active' | 'completed' | 'declined' | 'reassigned';
          notes?: string | null;
          assigned_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          rescue_case_id?: string;
          assigned_to?: string;
          assigned_by?: string;
          assignment_status?: 'active' | 'completed' | 'declined' | 'reassigned';
          notes?: string | null;
          assigned_at?: string;
          updated_at?: string;
        };
      };
      rescue_status_events: {
        Row: {
          id: string;
          rescue_case_id: string;
          from_status: string | null;
          to_status: string;
          changed_by: string;
          notes: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          rescue_case_id: string;
          from_status?: string | null;
          to_status: string;
          changed_by: string;
          notes?: string | null;
          changed_at?: string;
        };
        Update: {
          id?: string;
          rescue_case_id?: string;
          from_status?: string | null;
          to_status?: string;
          changed_by?: string;
          notes?: string | null;
          changed_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
