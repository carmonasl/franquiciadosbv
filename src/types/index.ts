export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "franchisee";
  franchise_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NewsItem {
  id: number;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface MyDocument {
  id: number;
  name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_by: string;
  created_at: string;
}

export interface Metric {
  id: number;
  franchise_id: string;
  month: string;
  revenue: number;
  customers: number;
  orders: number;
  created_at: string;
}
