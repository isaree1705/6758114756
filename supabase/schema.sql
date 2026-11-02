-- Run ONCE in a new Supabase project's SQL Editor as postgres.
-- If you already completed guided steps 2 and 4, do not rerun this file.
-- This intentionally fails rather than silently replacing existing tables/policies.
begin;

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text not null check (char_length(trim(description)) between 1 and 2000),
  author_nickname text not null check (char_length(trim(author_nickname)) between 1 and 40),
  created_at timestamptz not null default now()
);

create table public.votes (
  idea_id uuid not null references public.ideas(id) on delete cascade,
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (idea_id, voter_id)
);

alter table public.ideas enable row level security;
alter table public.votes enable row level security;
revoke all on table public.ideas, public.votes from public, anon, authenticated;

create role idea_board_app login nosuperuser nocreatedb nocreaterole
  noinherit noreplication nobypassrls;
grant connect on database postgres to idea_board_app;
grant usage on schema public to idea_board_app;
grant select, insert on public.ideas, public.votes to idea_board_app;

create policy "App can read ideas" on public.ideas
  for select to idea_board_app using (true);
create policy "App can submit ideas" on public.ideas
  for insert to idea_board_app with check (true);
create policy "App can read votes" on public.votes
  for select to idea_board_app using (true);
create policy "App can submit votes" on public.votes
  for insert to idea_board_app with check (true);

commit;

-- Set the role's password separately in Supabase; never save it in this file.
