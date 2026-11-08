export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Placeholder Database definition for M1 foundation.
 * Full schema with all 46 tables will be populated/generated via Supabase CLI in M2.
 */
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
          preferred_locale: string;
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
          preferred_locale?: string;
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
          preferred_locale?: string;
          city?: string | null;
          area_label?: string | null;
          account_status?: 'active' | 'suspended' | 'deactivated';
          created_at?: string;
          updated_at?: string;
        };
      };
      // Extended tables will be populated from schema in M2
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
