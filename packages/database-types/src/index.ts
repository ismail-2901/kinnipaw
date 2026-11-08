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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
