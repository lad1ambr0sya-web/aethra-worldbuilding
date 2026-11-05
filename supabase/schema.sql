-- Uma linha de dados Aethra por conta. A chave primária e o RLS isolam cada usuário.
create table if not exists public.aethra_workspaces (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.aethra_workspaces enable row level security;
revoke all on public.aethra_workspaces from anon;
grant select, insert, update, delete on public.aethra_workspaces to authenticated;

drop policy if exists "Users can access only their own Aethra workspace" on public.aethra_workspaces;
create policy "Users can access only their own Aethra workspace"
  on public.aethra_workspaces
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
