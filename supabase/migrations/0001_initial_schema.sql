-- Nattapedia: skema awal (MVP)
-- Jalankan di Supabase SQL Editor atau via `supabase db push`.
-- Tidak berisi data asli. Isi konten dilakukan Fai lewat halaman admin.

-- ---------------------------------------------------------------------------
-- Helper: daftar admin
-- Admin dibuat manual di Supabase Dashboard (Authentication > Users),
-- lalu user_id-nya dimasukkan ke tabel ini. Pendaftaran publik dimatikan.
-- ---------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Layanan
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  summary      text not null default '',
  description  text not null default '',
  icon         text,
  sort_order   int  not null default 0,
  is_published boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Portofolio
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_projects (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  client_name   text,               -- boleh kosong jika klien tidak ingin disebut
  category      text,
  summary       text not null default '',
  problem       text not null default '',
  solution      text not null default '',
  tech_stack    text[] not null default '{}',
  project_url   text,
  cover_image   text,               -- path di bucket storage "portfolio"
  is_featured   boolean not null default false,
  is_published  boolean not null default false,
  sort_order    int not null default 0,
  completed_at  date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table if not exists public.portfolio_images (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.portfolio_projects (id) on delete cascade,
  image_path  text not null,        -- path di bucket storage "portfolio"
  alt_text    text not null default '',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists portfolio_images_project_idx on public.portfolio_images (project_id);

-- ---------------------------------------------------------------------------
-- Testimoni (hanya tampil jika ada data asli dan dipublikasikan)
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id            uuid primary key default gen_random_uuid(),
  author_name   text not null,
  author_role   text,
  company       text,
  quote         text not null,
  avatar_image  text,
  project_id    uuid references public.portfolio_projects (id) on delete set null,
  is_published  boolean not null default false,
  sort_order    int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Pengaturan situs (satu baris, id = 1)
-- Teks beranda, tentang kami, kontak, WhatsApp, SEO dasar.
-- ---------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                 int primary key default 1 check (id = 1),
  site_name          text not null default 'Nattapedia',
  hero_title         text not null default '[CONTOH] Judul utama beranda',
  hero_subtitle      text not null default '[CONTOH] Subjudul beranda',
  about_content      text not null default '[CONTOH] Isi halaman Tentang Kami',
  process_content    text not null default '[CONTOH] Isi bagian Proses Kerja',
  contact_email      text,
  contact_phone      text,
  whatsapp_number    text,          -- format internasional tanpa +, mis. 62xxxxxxxxxx
  address            text,
  social_links       jsonb not null default '{}'::jsonb,
  seo_title          text,
  seo_description    text,
  og_image           text,
  updated_at         timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Leads (permintaan penawaran dari formulir kontak)
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.lead_status as enum ('baru', 'dihubungi', 'negosiasi', 'deal', 'batal');
exception when duplicate_object then null; end $$;

create table if not exists public.leads (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 1 and 120),
  email         text check (email is null or char_length(email) <= 200),
  phone         text check (phone is null or char_length(phone) <= 40),
  company       text check (company is null or char_length(company) <= 160),
  service_id    uuid references public.services (id) on delete set null,
  budget_range  text check (budget_range is null or char_length(budget_range) <= 80),
  message       text not null check (char_length(message) between 1 and 5000),
  source_page   text,
  status        public.lead_status not null default 'baru',
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  constraint leads_contact_required check (email is not null or phone is not null)
);
create index if not exists leads_created_idx on public.leads (created_at desc);

-- Trigger updated_at
do $$
declare t text;
begin
  foreach t in array array['services','portfolio_projects','testimonials','site_settings','leads'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Publik: baca konten yang is_published. Admin: semua akses.
-- Leads: publik TIDAK bisa insert langsung; insert lewat server (service role)
-- setelah validasi + anti-spam. Hanya admin yang bisa membaca.
-- ---------------------------------------------------------------------------
alter table public.admin_users        enable row level security;
alter table public.services           enable row level security;
alter table public.portfolio_projects enable row level security;
alter table public.portfolio_images   enable row level security;
alter table public.testimonials       enable row level security;
alter table public.site_settings      enable row level security;
alter table public.leads              enable row level security;

create policy "admin_users: admin read" on public.admin_users
  for select using (public.is_admin());

create policy "services: public read published" on public.services
  for select using (is_published or public.is_admin());
create policy "services: admin write" on public.services
  for all using (public.is_admin()) with check (public.is_admin());

create policy "portfolio: public read published" on public.portfolio_projects
  for select using (is_published or public.is_admin());
create policy "portfolio: admin write" on public.portfolio_projects
  for all using (public.is_admin()) with check (public.is_admin());

create policy "portfolio_images: public read" on public.portfolio_images
  for select using (
    public.is_admin() or exists (
      select 1 from public.portfolio_projects p
      where p.id = project_id and p.is_published
    )
  );
create policy "portfolio_images: admin write" on public.portfolio_images
  for all using (public.is_admin()) with check (public.is_admin());

create policy "testimonials: public read published" on public.testimonials
  for select using (is_published or public.is_admin());
create policy "testimonials: admin write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

create policy "site_settings: public read" on public.site_settings
  for select using (true);
create policy "site_settings: admin update" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

create policy "leads: admin read" on public.leads
  for select using (public.is_admin());
create policy "leads: admin update" on public.leads
  for update using (public.is_admin()) with check (public.is_admin());
create policy "leads: admin delete" on public.leads
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage: bucket publik "portfolio" untuk gambar (baca publik, tulis admin)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('portfolio', 'portfolio', true)
on conflict (id) do nothing;

create policy "portfolio bucket: admin insert" on storage.objects
  for insert with check (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio bucket: admin update" on storage.objects
  for update using (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio bucket: admin delete" on storage.objects
  for delete using (bucket_id = 'portfolio' and public.is_admin());
