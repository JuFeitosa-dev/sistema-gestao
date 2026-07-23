-- ============================================================================
--  Sistema de Gestão do Laboratório de Criatividade — Fase 1
--  Planta do banco de dados (tabelas, segurança e dados iniciais)
--
--  Como usar: cole TODO este conteúdo no "SQL Editor" do Supabase e clique em RUN.
--  Pode rodar mais de uma vez sem problema (é seguro / idempotente).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABELAS
-- ----------------------------------------------------------------------------

-- Organização: o "espaço" de uma empresa. O Laboratório é a primeira.
-- Já preparado para várias organizações no futuro (multi-org).
create table if not exists public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

-- Perfil: complementa o usuário de login (auth.users) com organização e papel.
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  org_id     uuid not null references public.organizations(id) on delete cascade,
  full_name  text,
  role       text not null default 'colaborador'
             check (role in ('admin', 'gestor', 'colaborador')),
  created_at timestamptz not null default now()
);

-- Área: categoria de trabalho interno (que não é de cliente).
create table if not exists public.areas (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  name       text not null,
  created_at timestamptz not null default now()
);

-- Cliente: para quem um projeto é entregue.
create table if not exists public.clients (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  name       text not null,
  contact    text,
  created_at timestamptz not null default now()
);

-- Projeto: um trabalho com começo e fim. É interno (área) OU de cliente.
create table if not exists public.projects (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  name         text not null,
  type         text not null default 'interno'
               check (type in ('interno', 'cliente')),
  area_id      uuid references public.areas(id) on delete set null,
  client_id    uuid references public.clients(id) on delete set null,
  closed_value numeric,  -- valor fechado (usado só na Fase 2; visível só p/ admin)
  status       text not null default 'ativo'
               check (status in ('ativo', 'pausado', 'concluido')),
  start_date   date,
  end_date     date,
  created_at   timestamptz not null default now()
);

-- Tarefa: uma unidade de trabalho dentro de um projeto.
create table if not exists public.tasks (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references public.organizations(id) on delete cascade,
  project_id     uuid not null references public.projects(id) on delete cascade,
  title          text not null,
  description    text,
  assignee_id    uuid references public.profiles(id) on delete set null,
  status         text not null default 'a_fazer'
                 check (status in ('a_fazer', 'fazendo', 'feito')),
  estimate_hours numeric,
  due_date       date,
  created_at     timestamptz not null default now()
);

-- Apontamento de hora (time entry): o coração do sistema.
-- Registro de tempo gasto por um usuário numa tarefa.
-- A duração é calculada automaticamente a partir do início e fim.
create table if not exists public.time_entries (
  id               uuid primary key default gen_random_uuid(),
  org_id           uuid not null references public.organizations(id) on delete cascade,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  task_id          uuid not null references public.tasks(id) on delete cascade,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz,
  duration_seconds integer generated always as (
                     case when ended_at is null then null
                          else greatest(0, extract(epoch from (ended_at - started_at))::int)
                     end
                   ) stored,
  kind             text not null default 'projeto'
                   check (kind in ('projeto', 'ao_vivo')),
  note             text,
  created_at       timestamptz not null default now()
);

-- Regra "um cronômetro ativo por vez por usuário":
-- só pode existir UM apontamento sem fim (ended_at nulo) por usuário.
create unique index if not exists one_active_timer_per_user
  on public.time_entries (user_id)
  where ended_at is null;

-- ----------------------------------------------------------------------------
-- 2. FUNÇÕES AUXILIARES (descobrem a organização e o papel de quem está logado)
-- ----------------------------------------------------------------------------

create or replace function public.current_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_user_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ----------------------------------------------------------------------------
-- 3. CRIAÇÃO AUTOMÁTICA DO PERFIL AO CADASTRAR UM USUÁRIO
--    O 1º usuário a se cadastrar vira "admin"; os seguintes viram "colaborador".
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_org   uuid;
  v_count int;
begin
  -- usa a organização mais antiga (na Fase 1 só existe uma: o Laboratório)
  select id into v_org from public.organizations order by created_at limit 1;

  select count(*) into v_count from public.profiles where org_id = v_org;

  insert into public.profiles (id, org_id, full_name, role)
  values (
    new.id,
    v_org,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when v_count = 0 then 'admin' else 'colaborador' end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 4. SEGURANÇA (Row Level Security) — isola os dados por organização
-- ----------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles      enable row level security;
alter table public.areas         enable row level security;
alter table public.clients       enable row level security;
alter table public.projects      enable row level security;
alter table public.tasks         enable row level security;
alter table public.time_entries  enable row level security;

-- ORGANIZATIONS: cada um só enxerga a própria organização.
drop policy if exists org_select on public.organizations;
create policy org_select on public.organizations
  for select using (id = public.current_org_id());

-- PROFILES: todos da organização se enxergam; só admin edita perfis (inclui papéis).
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (org_id = public.current_org_id());

drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin on public.profiles
  for update using (org_id = public.current_org_id() and public.current_user_role() = 'admin')
  with check (org_id = public.current_org_id());

-- AREAS: todos leem; admin/gestor gerenciam.
drop policy if exists areas_select on public.areas;
create policy areas_select on public.areas
  for select using (org_id = public.current_org_id());

drop policy if exists areas_write on public.areas;
create policy areas_write on public.areas
  for all using (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'))
  with check (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'));

-- CLIENTS: todos leem; admin/gestor gerenciam.
drop policy if exists clients_select on public.clients;
create policy clients_select on public.clients
  for select using (org_id = public.current_org_id());

drop policy if exists clients_write on public.clients;
create policy clients_write on public.clients
  for all using (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'))
  with check (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'));

-- PROJECTS: todos leem; admin/gestor gerenciam.
drop policy if exists projects_select on public.projects;
create policy projects_select on public.projects
  for select using (org_id = public.current_org_id());

drop policy if exists projects_write on public.projects;
create policy projects_write on public.projects
  for all using (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'))
  with check (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'));

-- TASKS: todos leem; admin/gestor gerenciam; colaborador pode mexer nas próprias tarefas.
drop policy if exists tasks_select on public.tasks;
create policy tasks_select on public.tasks
  for select using (org_id = public.current_org_id());

drop policy if exists tasks_insert on public.tasks;
create policy tasks_insert on public.tasks
  for insert with check (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'));

drop policy if exists tasks_update on public.tasks;
create policy tasks_update on public.tasks
  for update using (
    org_id = public.current_org_id()
    and (public.current_user_role() in ('admin', 'gestor') or assignee_id = auth.uid())
  );

drop policy if exists tasks_delete on public.tasks;
create policy tasks_delete on public.tasks
  for delete using (org_id = public.current_org_id() and public.current_user_role() in ('admin', 'gestor'));

-- TIME_ENTRIES: cada um vê e edita os próprios apontamentos; admin/gestor veem todos.
drop policy if exists time_select on public.time_entries;
create policy time_select on public.time_entries
  for select using (
    org_id = public.current_org_id()
    and (public.current_user_role() in ('admin', 'gestor') or user_id = auth.uid())
  );

drop policy if exists time_insert on public.time_entries;
create policy time_insert on public.time_entries
  for insert with check (org_id = public.current_org_id() and user_id = auth.uid());

drop policy if exists time_update on public.time_entries;
create policy time_update on public.time_entries
  for update using (
    org_id = public.current_org_id()
    and (user_id = auth.uid() or public.current_user_role() = 'admin')
  );

drop policy if exists time_delete on public.time_entries;
create policy time_delete on public.time_entries
  for delete using (
    org_id = public.current_org_id()
    and (user_id = auth.uid() or public.current_user_role() = 'admin')
  );

-- ----------------------------------------------------------------------------
-- 5. DADOS INICIAIS — cria o Laboratório e suas áreas internas (só se ainda não existir)
-- ----------------------------------------------------------------------------

insert into public.organizations (name)
select 'Laboratório de Criatividade'
where not exists (select 1 from public.organizations);

insert into public.areas (org_id, name)
select o.id, a.name
from public.organizations o
cross join (values
  ('Administrativo'),
  ('Marketing'),
  ('Financeiro'),
  ('Produto/FSA'),
  ('Comercial')
) as a(name)
where o.name = 'Laboratório de Criatividade'
  and not exists (select 1 from public.areas x where x.org_id = o.id and x.name = a.name);
