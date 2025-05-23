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
      companies: {
        Row: {
          id: string;
          name: string | null;
          tax_id: string | null;
          country: string | null;
          settings: Json | null;
          created_at: string;
          updated_at: string | null;
          logo_url: string | null;
          nombre_empresa: string | null;
          rut: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          tax_id?: string | null;
          country?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string | null;
          logo_url?: string | null;
          nombre_empresa?: string | null;
          rut?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          tax_id?: string | null;
          country?: string | null;
          settings?: Json | null;
          created_at?: string;
          updated_at?: string | null;
          logo_url?: string | null;
          nombre_empresa?: string | null;
          rut?: string | null;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string;
          company_id: string | null;
          role: string | null;
          subscription: string | null;
          created_at: string;
          updated_at: string | null;
          last_login: string | null;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name: string;
          company_id?: string | null;
          role?: string | null;
          subscription?: string | null;
          created_at?: string;
          updated_at?: string | null;
          last_login?: string | null;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string;
          company_id?: string | null;
          role?: string | null;
          subscription?: string | null;
          created_at?: string;
          updated_at?: string | null;
          last_login?: string | null;
        };
      };
      user_companies: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          role: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          role?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          role?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      user_settings: {
        Row: {
          id: string;
          theme: string | null;
          dashboard_layout: Json | null;
          favorite_features: string[] | null;
          notifications_config: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          theme?: string | null;
          dashboard_layout?: Json | null;
          favorite_features?: string[] | null;
          notifications_config?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          theme?: string | null;
          dashboard_layout?: Json | null;
          favorite_features?: string[] | null;
          notifications_config?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      import_export: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          type: string;
          status: string;
          file_name: string;
          file_path: string;
          errors: Json | null;
          results: Json | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          type: string;
          status: string;
          file_name: string;
          file_path: string;
          errors?: Json | null;
          results?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          type?: string;
          status?: string;
          file_name?: string;
          file_path?: string;
          errors?: Json | null;
          results?: Json | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      shipments: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string | null;
          company_id: string;
          shipping_type: string | null;
          origin: string | null;
          destination: string | null;
          status: string | null;
          estimated_arrival: string | null;
          reference: string | null;
          notes: Json | null;
          customs_status: string | null;
          contact_info: Json | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          company_id: string;
          shipping_type?: string | null;
          origin?: string | null;
          destination?: string | null;
          status?: string | null;
          estimated_arrival?: string | null;
          reference?: string | null;
          notes?: Json | null;
          customs_status?: string | null;
          contact_info?: Json | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string | null;
          company_id?: string;
          shipping_type?: string | null;
          origin?: string | null;
          destination?: string | null;
          status?: string | null;
          estimated_arrival?: string | null;
          reference?: string | null;
          notes?: Json | null;
          customs_status?: string | null;
          contact_info?: Json | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
