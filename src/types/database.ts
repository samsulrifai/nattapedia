// Tipe skema database, selaras dengan supabase/migrations/0001_initial_schema.sql.
// Setelah proyek Supabase dibuat, file ini sebaiknya di-generate ulang:
//   npx supabase gen types typescript --project-id <PROJECT_ID> > src/types/database.ts

type Timestamps = { created_at: string; updated_at: string };

export type LeadStatus = "baru" | "dihubungi" | "negosiasi" | "deal" | "batal";

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  icon: string | null;
  sort_order: number;
  is_published: boolean;
} & Timestamps;

export type PortfolioProject = {
  id: string;
  slug: string;
  title: string;
  client_name: string | null;
  category: string | null;
  summary: string;
  problem: string;
  solution: string;
  tech_stack: string[];
  project_url: string | null;
  cover_image: string | null;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  completed_at: string | null;
} & Timestamps;

export type PortfolioImage = {
  id: string;
  project_id: string;
  image_path: string;
  alt_text: string;
  sort_order: number;
  created_at: string;
};

export type Testimonial = {
  id: string;
  author_name: string;
  author_role: string | null;
  company: string | null;
  quote: string;
  avatar_image: string | null;
  project_id: string | null;
  is_published: boolean;
  sort_order: number;
} & Timestamps;

export type SiteSettings = {
  id: number;
  site_name: string;
  hero_title: string;
  hero_subtitle: string;
  about_content: string;
  process_content: string;
  contact_email: string | null;
  contact_phone: string | null;
  whatsapp_number: string | null;
  address: string | null;
  social_links: Record<string, string>;
  seo_title: string | null;
  seo_description: string | null;
  og_image: string | null;
  updated_at: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  service_id: string | null;
  budget_range: string | null;
  message: string;
  source_page: string | null;
  status: LeadStatus;
  admin_notes: string | null;
} & Timestamps;

export type AdminUser = { user_id: string; created_at: string };

type Table<Row, Required extends keyof Row> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      admin_users: Table<AdminUser, "user_id">;
      services: Table<Service, "slug" | "title">;
      portfolio_projects: Table<PortfolioProject, "slug" | "title">;
      portfolio_images: Table<PortfolioImage, "project_id" | "image_path">;
      testimonials: Table<Testimonial, "author_name" | "quote">;
      site_settings: Table<SiteSettings, never>;
      leads: Table<Lead, "name" | "message">;
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { lead_status: LeadStatus };
    CompositeTypes: Record<string, never>;
  };
};
