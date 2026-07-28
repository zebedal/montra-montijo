create table if not exists public.specialties (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.category_specialties (
  category_id uuid not null references public.categories(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete cascade,
  position smallint not null default 0,
  primary key (category_id, specialty_id)
);

create table if not exists public.business_specialties (
  business_id uuid not null references public.businesses(id) on delete cascade,
  specialty_id uuid not null references public.specialties(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (business_id, specialty_id)
);

create or replace function public.validate_business_specialty()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  selected_category_id uuid;
  selected_count integer;
begin
  select category_id into selected_category_id
  from public.businesses
  where id = new.business_id;

  if not exists (
    select 1 from public.category_specialties
    where category_id = selected_category_id
      and specialty_id = new.specialty_id
  ) then
    raise exception 'A especialidade não pertence à categoria do negócio.';
  end if;

  select count(*) into selected_count
  from public.business_specialties
  where business_id = new.business_id;

  if selected_count >= 4 then
    raise exception 'Cada negócio pode ter no máximo quatro especialidades.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_business_specialty_trigger
on public.business_specialties;

create trigger validate_business_specialty_trigger
before insert on public.business_specialties
for each row execute function public.validate_business_specialty();

alter table public.specialties enable row level security;
alter table public.category_specialties enable row level security;
alter table public.business_specialties enable row level security;

drop policy if exists "Especialidades são públicas" on public.specialties;
drop policy if exists "Especialidades das categorias são públicas" on public.category_specialties;
drop policy if exists "Especialidades dos negócios são públicas" on public.business_specialties;
drop policy if exists "Proprietários podem adicionar especialidades" on public.business_specialties;
drop policy if exists "Proprietários podem remover especialidades" on public.business_specialties;

create policy "Especialidades são públicas"
on public.specialties for select using (true);

create policy "Especialidades das categorias são públicas"
on public.category_specialties for select using (true);

create policy "Especialidades dos negócios são públicas"
on public.business_specialties for select using (true);

create policy "Proprietários podem adicionar especialidades"
on public.business_specialties for insert to authenticated
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = business_specialties.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Proprietários podem remover especialidades"
on public.business_specialties for delete to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_specialties.business_id
      and businesses.user_id = auth.uid()
  )
);

with seed(category_slug, specialty_slug, specialty_name, position) as (
  values
    ('cabeleireiros', 'coloracao', 'Coloração', 0),
    ('cabeleireiros', 'madeixas', 'Madeixas', 1),
    ('cabeleireiros', 'tratamentos-capilares', 'Tratamentos capilares', 2),
    ('cabeleireiros', 'extensoes', 'Extensões', 3),
    ('cabeleireiros', 'penteados', 'Penteados', 4),
    ('cabeleireiros', 'cabelos-afro', 'Cabelos afro', 5),
    ('cabeleireiros', 'estetica', 'Estética', 6),
    ('cabeleireiros', 'manicure-pedicure', 'Manicure e pedicure', 7),
    ('barbearias', 'corte-masculino', 'Corte masculino', 0),
    ('barbearias', 'barba', 'Barba', 1),
    ('barbearias', 'corte-infantil', 'Corte infantil', 2),
    ('barbearias', 'coloracao', 'Coloração', 3),
    ('estetica', 'depilacao', 'Depilação', 0),
    ('estetica', 'limpeza-pele', 'Limpeza de pele', 1),
    ('estetica', 'maquilhagem', 'Maquilhagem', 2),
    ('estetica', 'massagens', 'Massagens', 3),
    ('estetica', 'tratamentos-corpo', 'Tratamentos de corpo', 4),
    ('estetica', 'manicure-pedicure', 'Manicure e pedicure', 5),
    ('nails', 'unhas-gel', 'Unhas de gel', 0),
    ('nails', 'verniz-gel', 'Verniz gel', 1),
    ('nails', 'nail-art', 'Nail art', 2),
    ('nails', 'manicure-pedicure', 'Manicure e pedicure', 3),
    ('spas', 'massagens', 'Massagens', 0),
    ('spas', 'tratamentos-rosto', 'Tratamentos de rosto', 1),
    ('spas', 'tratamentos-corpo', 'Tratamentos de corpo', 2),
    ('spas', 'sauna', 'Sauna', 3),
    ('restaurantes', 'cozinha-portuguesa', 'Cozinha portuguesa', 0),
    ('restaurantes', 'peixe-marisco', 'Peixe e marisco', 1),
    ('restaurantes', 'vegetariano', 'Opções vegetarianas', 2),
    ('restaurantes', 'take-away', 'Take-away', 3),
    ('restaurantes', 'entregas', 'Entregas ao domicílio', 4),
    ('restaurantes', 'esplanada', 'Esplanada', 5),
    ('restaurantes', 'grupos', 'Grupos', 6),
    ('cafes', 'pequenos-almocos', 'Pequenos-almoços', 0),
    ('cafes', 'brunch', 'Brunch', 1),
    ('cafes', 'esplanada', 'Esplanada', 2),
    ('cafes', 'pastelaria', 'Pastelaria', 3),
    ('snack-bars', 'refeicoes-rapidas', 'Refeições rápidas', 0),
    ('snack-bars', 'take-away', 'Take-away', 1),
    ('snack-bars', 'esplanada', 'Esplanada', 2),
    ('takeaway', 'cozinha-portuguesa', 'Cozinha portuguesa', 0),
    ('takeaway', 'vegetariano', 'Opções vegetarianas', 1),
    ('takeaway', 'entregas', 'Entregas ao domicílio', 2),
    ('bares', 'cocktails', 'Cocktails', 0),
    ('bares', 'musica-ao-vivo', 'Música ao vivo', 1),
    ('bares', 'esplanada', 'Esplanada', 2),
    ('bares', 'petiscos', 'Petiscos', 3),
    ('pastelarias', 'pastelaria', 'Pastelaria', 0),
    ('pastelarias', 'bolos-personalizados', 'Bolos personalizados', 1),
    ('pastelarias', 'pequenos-almocos', 'Pequenos-almoços', 2),
    ('pastelarias', 'esplanada', 'Esplanada', 3)
)
insert into public.specialties (slug, name)
select distinct specialty_slug, specialty_name from seed
on conflict (slug) do update set name = excluded.name;

with seed(category_slug, specialty_slug, position) as (
  values
    ('cabeleireiros','coloracao',0),('cabeleireiros','madeixas',1),('cabeleireiros','tratamentos-capilares',2),('cabeleireiros','extensoes',3),('cabeleireiros','penteados',4),('cabeleireiros','cabelos-afro',5),('cabeleireiros','estetica',6),('cabeleireiros','manicure-pedicure',7),
    ('barbearias','corte-masculino',0),('barbearias','barba',1),('barbearias','corte-infantil',2),('barbearias','coloracao',3),
    ('estetica','depilacao',0),('estetica','limpeza-pele',1),('estetica','maquilhagem',2),('estetica','massagens',3),('estetica','tratamentos-corpo',4),('estetica','manicure-pedicure',5),
    ('nails','unhas-gel',0),('nails','verniz-gel',1),('nails','nail-art',2),('nails','manicure-pedicure',3),
    ('spas','massagens',0),('spas','tratamentos-rosto',1),('spas','tratamentos-corpo',2),('spas','sauna',3),
    ('restaurantes','cozinha-portuguesa',0),('restaurantes','peixe-marisco',1),('restaurantes','vegetariano',2),('restaurantes','take-away',3),('restaurantes','entregas',4),('restaurantes','esplanada',5),('restaurantes','grupos',6),
    ('cafes','pequenos-almocos',0),('cafes','brunch',1),('cafes','esplanada',2),('cafes','pastelaria',3),
    ('snack-bars','refeicoes-rapidas',0),('snack-bars','take-away',1),('snack-bars','esplanada',2),
    ('takeaway','cozinha-portuguesa',0),('takeaway','vegetariano',1),('takeaway','entregas',2),
    ('bares','cocktails',0),('bares','musica-ao-vivo',1),('bares','esplanada',2),('bares','petiscos',3),
    ('pastelarias','pastelaria',0),('pastelarias','bolos-personalizados',1),('pastelarias','pequenos-almocos',2),('pastelarias','esplanada',3)
)
insert into public.category_specialties (category_id, specialty_id, position)
select categories.id, specialties.id, seed.position
from seed
join public.categories on categories.slug = seed.category_slug
join public.specialties on specialties.slug = seed.specialty_slug
on conflict (category_id, specialty_id)
do update set position = excluded.position;

notify pgrst, 'reload schema';
