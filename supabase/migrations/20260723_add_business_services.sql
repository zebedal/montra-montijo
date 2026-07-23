create table if not exists public.business_services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 100),
  description text check (description is null or char_length(description) <= 300),
  price_type text not null check (price_type in ('fixed', 'from', 'quote')),
  price numeric(10, 2) check (price is null or price >= 0),
  position smallint not null default 0 check (position between 0 and 7),
  created_at timestamptz not null default now(),
  unique (business_id, position),
  check (
    (price_type = 'quote' and price is null)
    or (price_type in ('fixed', 'from') and price is not null)
  )
);

alter table public.business_services enable row level security;

drop policy if exists "Serviços são públicos" on public.business_services;
drop policy if exists "Proprietários podem adicionar serviços" on public.business_services;
drop policy if exists "Proprietários podem atualizar serviços" on public.business_services;
drop policy if exists "Proprietários podem remover serviços" on public.business_services;

create policy "Serviços são públicos"
on public.business_services for select
using (true);

create policy "Proprietários podem adicionar serviços"
on public.business_services for insert
to authenticated
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = business_services.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Proprietários podem atualizar serviços"
on public.business_services for update
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_services.business_id
      and businesses.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.businesses
    where businesses.id = business_services.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Proprietários podem remover serviços"
on public.business_services for delete
to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_services.business_id
      and businesses.user_id = auth.uid()
  )
);
