create table if not exists public.user_store (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

alter table public.user_store enable row level security;

drop policy if exists "Users can view their own store" on public.user_store;
create policy "Users can view their own store"
on public.user_store
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own store" on public.user_store;
create policy "Users can insert their own store"
on public.user_store
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own store" on public.user_store;
create policy "Users can update their own store"
on public.user_store
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own store" on public.user_store;
create policy "Users can delete their own store"
on public.user_store
for delete
using (auth.uid() = user_id);

create table if not exists public.companies (
  user_id uuid not null references auth.users(id) on delete cascade,
  id text not null,
  name text not null,
  industry text not null default '',
  test_type text,
  desired_job_type text,
  salary_info text,
  contact_person text,
  phone text,
  email text,
  my_page_url text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

alter table public.companies add column if not exists desired_job_type text;
alter table public.companies add column if not exists salary_info text;
alter table public.companies add column if not exists test_type text;

alter table public.companies enable row level security;

drop policy if exists "Users can view their own companies" on public.companies;
create policy "Users can view their own companies"
on public.companies
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own companies" on public.companies;
create policy "Users can insert their own companies"
on public.companies
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own companies" on public.companies;
create policy "Users can update their own companies"
on public.companies
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own companies" on public.companies;
create policy "Users can delete their own companies"
on public.companies
for delete
using (auth.uid() = user_id);

create table if not exists public.calendar_feeds (
  token text primary key,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  schedules jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.calendar_feeds enable row level security;

drop policy if exists "Public can read calendar feeds" on public.calendar_feeds;
create policy "Public can read calendar feeds"
on public.calendar_feeds
for select
using (true);

drop policy if exists "Users can insert their own calendar feeds" on public.calendar_feeds;
create policy "Users can insert their own calendar feeds"
on public.calendar_feeds
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own calendar feeds" on public.calendar_feeds;
create policy "Users can update their own calendar feeds"
on public.calendar_feeds
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own calendar feeds" on public.calendar_feeds;
create policy "Users can delete their own calendar feeds"
on public.calendar_feeds
for delete
using (auth.uid() = user_id);

do $$
begin
  begin
    alter publication supabase_realtime add table public.companies;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.user_store;
  exception
    when duplicate_object then null;
  end;

  begin
    alter publication supabase_realtime add table public.calendar_feeds;
  exception
    when duplicate_object then null;
  end;
end
$$;
