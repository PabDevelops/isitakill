-- Run this in your Supabase SQL editor

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  subscription_status text default 'free',
  stripe_customer_id text,
  has_used_free_trial_boost boolean default false,
  updated_at timestamptz default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  link text,
  description text not null,
  builder_verdict text check (builder_verdict in ('build', 'kill')) not null,
  slug text unique not null,
  created_at timestamptz default now(),
  voting_ends_at timestamptz,
  screenshot_urls text,
  monthly_revenue numeric,
  users_count integer,
  monthly_visits integer,
  capital_invested numeric,
  logo_url text,
  thumbnail_url text,
  categories text[],
  pricing_tier text check (pricing_tier in ('free', 'freemium', 'paid')),
  creator_name text,
  creator_twitter text,
  boosted_until timestamptz,
  boost_type text check (boost_type in ('paid', 'trial')),
  trial_boost_views integer default 0,
  trial_boost_votes integer default 0
);

create table if not exists votes (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  vote text check (vote in ('build', 'kill')) not null,
  voter_fingerprint text not null,
  created_at timestamptz default now(),
  unique(project_id, voter_fingerprint)
);

-- RLS
alter table profiles enable row level security;
alter table projects enable row level security;
alter table votes enable row level security;

-- Profiles: user can read/update own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

-- Projects: public read, owner write
create policy "Anyone can view projects" on projects for select using (true);
create policy "Users can create projects" on projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on projects for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on projects for delete using (auth.uid() = user_id);

-- Votes: public read, anyone can insert, no update/delete
create policy "Anyone can view votes" on votes for select using (true);
create policy "Anyone can vote" on votes for insert with check (true);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Migration: run this if your projects table already existed before these columns were added
alter table projects add column if not exists screenshot_urls text;
alter table projects add column if not exists monthly_revenue numeric;
alter table projects add column if not exists users_count integer;
alter table projects add column if not exists monthly_visits integer;
alter table projects add column if not exists capital_invested numeric;
alter table projects add column if not exists logo_url text;
alter table projects add column if not exists thumbnail_url text;
alter table projects add column if not exists categories text[];
alter table projects add column if not exists pricing_tier text check (pricing_tier in ('free', 'freemium', 'paid'));
alter table projects add column if not exists creator_name text;
alter table projects add column if not exists creator_twitter text;

-- Storage bucket for uploaded logos/thumbnails
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;

create policy "Public read access on project-images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Authenticated users can upload project-images"
  on storage.objects for insert
  with check (bucket_id = 'project-images' and auth.role() = 'authenticated');

create policy "Users can update their own project-images"
  on storage.objects for update
  using (bucket_id = 'project-images' and auth.uid() = owner);

create policy "Users can delete their own project-images"
  on storage.objects for delete
  using (bucket_id = 'project-images' and auth.uid() = owner);

-- Migration: boost system
alter table profiles add column if not exists has_used_free_trial_boost boolean default false;
alter table projects add column if not exists boosted_until timestamptz;
alter table projects add column if not exists boost_type text check (boost_type in ('paid', 'trial'));
alter table projects add column if not exists trial_boost_views integer default 0;
alter table projects add column if not exists trial_boost_votes integer default 0;
