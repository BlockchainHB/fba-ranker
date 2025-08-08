-- Enable extensions
create extension if not exists "pgcrypto";

-- Profiles table mirroring auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  discord text,
  avatar_url text,
  role text not null default 'user', -- 'user' | 'admin'
  created_at timestamptz not null default now()
);

-- Insert a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Submissions table
create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_name text not null,
  revenue numeric not null check (revenue >= 0),
  cost numeric not null check (cost >= 0),
  profit numeric not null check (profit >= 0),
  date timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  proof_url text,
  note text,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_submissions_status on public.submissions(status);
create index if not exists idx_submissions_user on public.submissions(user_id);
create index if not exists idx_submissions_date on public.submissions(date);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.submissions enable row level security;

-- Profiles policies
create policy "Users can view their own profile"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles
  for select
  to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Submissions policies
create policy "Public can view approved submissions"
  on public.submissions
  for select
  using (status = 'approved');

create policy "Users can view their own submissions"
  on public.submissions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own submissions"
  on public.submissions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Admins can select all submissions"
  on public.submissions
  for select
  to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "Admins can update submissions"
  on public.submissions
  for update
  to authenticated
  using (exists(select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
  with check (true);

-- NOTE: Create a Storage bucket named 'proofs' in Supabase (Dashboard → Storage) 
-- and add a policy allowing authenticated users to upload to paths under their user_id.
-- Example storage policy (Storage → proofs → Policies):
-- "Users can upload to their folder":
-- (bucket_id = 'proofs') and (auth.role() = 'authenticated') and (position(object_name, auth.uid()::text) = 1)
