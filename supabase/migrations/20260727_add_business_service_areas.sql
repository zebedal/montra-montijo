create table if not exists public.service_areas (
  slug text primary key,
  name text not null unique,
  position smallint not null default 0,
  created_at timestamptz not null default now()
);

insert into public.service_areas (slug, name, position)
values
  ('alcochete', 'Alcochete', 0),
  ('almada', 'Almada', 1),
  ('barreiro', 'Barreiro', 2),
  ('moita', 'Moita', 3),
  ('montijo', 'Montijo', 4),
  ('palmela', 'Palmela', 5),
  ('seixal', 'Seixal', 6),
  ('sesimbra', 'Sesimbra', 7),
  ('setubal', 'Setúbal', 8)
on conflict (slug) do update
set name = excluded.name, position = excluded.position;

create table if not exists public.business_service_areas (
  business_id uuid not null references public.businesses(id) on delete cascade,
  area_slug text not null references public.service_areas(slug) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (business_id, area_slug)
);

alter table public.service_areas enable row level security;
alter table public.business_service_areas enable row level security;

drop policy if exists "Áreas de serviço são públicas" on public.service_areas;
drop policy if exists "Cobertura dos negócios é pública" on public.business_service_areas;
drop policy if exists "Proprietários podem adicionar áreas" on public.business_service_areas;
drop policy if exists "Proprietários podem remover áreas" on public.business_service_areas;

create policy "Áreas de serviço são públicas"
on public.service_areas for select
using (true);

create policy "Cobertura dos negócios é pública"
on public.business_service_areas for select
using (true);

create policy "Proprietários podem adicionar áreas"
on public.business_service_areas for insert
to authenticated
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = business_service_areas.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Proprietários podem remover áreas"
on public.business_service_areas for delete
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_service_areas.business_id
      and businesses.user_id = auth.uid()
  )
);

notify pgrst, 'reload schema';
