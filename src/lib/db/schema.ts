// Skema database Nattapedia (Neon Postgres) dalam Drizzle ORM.
// Sumber kebenaran skema. Migrasi SQL di folder drizzle/ di-generate dari file ini:
//   npm run db:generate   (buat file migrasi baru setelah skema diubah)
//   npm run db:migrate    (jalankan migrasi ke DATABASE_URL_UNPOOLED / DATABASE_URL)
//
// Konvensi:
// - Tabel konten memakai nama properti snake_case (sama dengan nama kolom),
//   supaya objek baris di komponen tetap `project.cover_image`, dst.
// - Tabel auth (user, session, account, verification, rate_limit) mengikuti
//   format Better Auth: nama properti camelCase, kolom snake_case. Jangan ubah
//   nama propertinya tanpa menyesuaikan konfigurasi Better Auth.
// - Tidak ada Row Level Security. Otorisasi dilakukan di kode server:
//   halaman publik WAJIB memfilter is_published = true, dan setiap Server
//   Action admin WAJIB memanggil requireAdmin() lebih dulu.
import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

const created_at = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updated_at = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Layanan
// ---------------------------------------------------------------------------
export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  icon: text("icon"),
  sort_order: integer("sort_order").notNull().default(0),
  is_published: boolean("is_published").notNull().default(false),
  created_at,
  updated_at,
});

// ---------------------------------------------------------------------------
// Portofolio
// ---------------------------------------------------------------------------
export const portfolio_projects = pgTable("portfolio_projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client_name: text("client_name"), // boleh kosong jika klien tidak ingin disebut
  category: text("category"),
  summary: text("summary").notNull().default(""),
  problem: text("problem").notNull().default(""),
  solution: text("solution").notNull().default(""),
  tech_stack: text("tech_stack").array().notNull().default(sql`'{}'::text[]`),
  project_url: text("project_url"),
  cover_image: text("cover_image"), // key objek di storage (lihat src/lib/storage.ts)
  is_featured: boolean("is_featured").notNull().default(false),
  is_published: boolean("is_published").notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  completed_at: date("completed_at"),
  created_at,
  updated_at,
});

export const portfolio_images = pgTable(
  "portfolio_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    project_id: uuid("project_id")
      .notNull()
      .references(() => portfolio_projects.id, { onDelete: "cascade" }),
    image_path: text("image_path").notNull(), // key objek di storage
    alt_text: text("alt_text").notNull().default(""),
    sort_order: integer("sort_order").notNull().default(0),
    created_at,
  },
  (t) => [index("portfolio_images_project_idx").on(t.project_id)],
);

// ---------------------------------------------------------------------------
// Testimoni (hanya tampil jika ada data asli dan dipublikasikan)
// ---------------------------------------------------------------------------
export const testimonials = pgTable("testimonials", {
  id: uuid("id").primaryKey().defaultRandom(),
  author_name: text("author_name").notNull(),
  author_role: text("author_role"),
  company: text("company"),
  quote: text("quote").notNull(),
  avatar_image: text("avatar_image"),
  project_id: uuid("project_id").references(() => portfolio_projects.id, {
    onDelete: "set null",
  }),
  is_published: boolean("is_published").notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  created_at,
  updated_at,
});

// ---------------------------------------------------------------------------
// Pengaturan situs (satu baris, id = 1). Baris awal dibuat oleh migrasi.
// ---------------------------------------------------------------------------
export const site_settings = pgTable(
  "site_settings",
  {
    id: integer("id").primaryKey().default(1),
    site_name: text("site_name").notNull().default("Nattapedia"),
    hero_title: text("hero_title").notNull().default("[CONTOH] Judul utama beranda"),
    hero_subtitle: text("hero_subtitle").notNull().default("[CONTOH] Subjudul beranda"),
    about_content: text("about_content").notNull().default("[CONTOH] Isi halaman Tentang Kami"),
    process_content: text("process_content")
      .notNull()
      .default("[CONTOH] Isi bagian Proses Kerja"),
    contact_email: text("contact_email"),
    contact_phone: text("contact_phone"),
    whatsapp_number: text("whatsapp_number"), // format internasional tanpa +, mis. 62xxxxxxxxxx
    address: text("address"),
    social_links: jsonb("social_links")
      .$type<Record<string, string>>()
      .notNull()
      .default(sql`'{}'::jsonb`),
    seo_title: text("seo_title"),
    seo_description: text("seo_description"),
    og_image: text("og_image"),
    updated_at,
  },
  (t) => [check("site_settings_singleton", sql`${t.id} = 1`)],
);

// ---------------------------------------------------------------------------
// Leads (permintaan penawaran dari formulir kontak)
// ---------------------------------------------------------------------------
export const leadStatus = pgEnum("lead_status", [
  "baru",
  "dihubungi",
  "negosiasi",
  "deal",
  "batal",
]);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    company: text("company"),
    service_id: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    budget_range: text("budget_range"),
    message: text("message").notNull(),
    source_page: text("source_page"),
    status: leadStatus("status").notNull().default("baru"),
    admin_notes: text("admin_notes"),
    created_at,
    updated_at,
  },
  (t) => [
    index("leads_created_idx").on(t.created_at.desc()),
    check("leads_name_len", sql`char_length(${t.name}) between 1 and 120`),
    check("leads_email_len", sql`${t.email} is null or char_length(${t.email}) <= 200`),
    check("leads_phone_len", sql`${t.phone} is null or char_length(${t.phone}) <= 40`),
    check("leads_company_len", sql`${t.company} is null or char_length(${t.company}) <= 160`),
    check(
      "leads_budget_len",
      sql`${t.budget_range} is null or char_length(${t.budget_range}) <= 80`,
    ),
    check("leads_message_len", sql`char_length(${t.message}) between 1 and 5000`),
    check("leads_contact_required", sql`${t.email} is not null or ${t.phone} is not null`),
  ],
);

// ---------------------------------------------------------------------------
// Auth (Better Auth). Pendaftaran publik dimatikan; akun admin dibuat lewat
// `npm run admin:create`. Setiap baris di tabel user adalah admin.
// ---------------------------------------------------------------------------
const authCreatedAt = timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const authUpdatedAt = timestamp("updated_at", { withTimezone: true })
  .notNull()
  .defaultNow()
  .$onUpdate(() => new Date());

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: authCreatedAt,
  updatedAt: authUpdatedAt,
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: authCreatedAt,
    updatedAt: authUpdatedAt,
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"), // hash, bukan teks asli
    createdAt: authCreatedAt,
    updatedAt: authUpdatedAt,
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: authCreatedAt,
    updatedAt: authUpdatedAt,
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

// Batas percobaan login (anti brute force), disimpan di DB karena serverless.
export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});
