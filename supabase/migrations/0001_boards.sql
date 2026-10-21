-- One board (projects + idea notes) per signed-in user.
-- Row-level security means each user can only ever read or change their own row,
-- even though the browser talks to the database directly with the public anon key.
create table if not exists public.boards (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{"projects": [], "notes": []}'::jsonb,
  updated_at timestamptz not null default now(),
  -- Keep a runaway client from filling the database.
  constraint boards_data_size check (pg_column_size(data) < 2000000)
);

alter table public.boards enable row level security;

create policy "Users read their own board" on public.boards
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "Users create their own board" on public.boards
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy "Users update their own board" on public.boards
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "Users delete their own board" on public.boards
  for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.boards from anon;
