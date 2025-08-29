export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: "admin" | "franchisee";
          franchise_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role?: "admin" | "franchisee";
          franchise_id?: string | null;
        };
        Update: {
          email?: string;
          full_name?: string;
          role?: "admin" | "franchisee";
          franchise_id?: string | null;
        };
      };
      news: {
        Row: {
          id: number;
          title: string;
          content: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          content: string;
          created_by?: string;
        };
        Update: {
          title?: string;
          content?: string;
        };
      };
      documents: {
        Row: {
          id: number;
          name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          uploaded_by?: string;
        };
        Update: {
          name?: string;
        };
      };
      metrics: {
        Row: {
          id: number;
          franchise_id: string;
          month: string;
          revenue: number;
          customers: number;
          orders: number;
          created_at: string;
        };
        Insert: {
          franchise_id: string;
          month: string;
          revenue: number;
          customers: number;
          orders: number;
        };
        Update: {
          revenue?: number;
          customers?: number;
          orders?: number;
        };
      };
    };
  };
}
