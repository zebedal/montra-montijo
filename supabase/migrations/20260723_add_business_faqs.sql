create table if not exists public.business_faqs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  question text not null check (char_length(question) between 5 and 160),
  answer text not null check (char_length(answer) between 5 and 1000),
  position smallint not null default 0 check (position between 0 and 4),
  created_at timestamptz not null default now(),
  unique (business_id, position)
);

alter table public.business_faqs enable row level security;

drop policy if exists "Perguntas frequentes são públicas" on public.business_faqs;
drop policy if exists "Proprietários podem adicionar perguntas frequentes" on public.business_faqs;
drop policy if exists "Proprietários podem atualizar perguntas frequentes" on public.business_faqs;
drop policy if exists "Proprietários podem remover perguntas frequentes" on public.business_faqs;

create policy "Perguntas frequentes são públicas"
on public.business_faqs for select
using (true);

create policy "Proprietários podem adicionar perguntas frequentes"
on public.business_faqs for insert
to authenticated
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_faqs.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Proprietários podem atualizar perguntas frequentes"
on public.business_faqs for update
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_faqs.business_id
      and businesses.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_faqs.business_id
      and businesses.user_id = auth.uid()
  )
);

create policy "Proprietários podem remover perguntas frequentes"
on public.business_faqs for delete
to authenticated
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_faqs.business_id
      and businesses.user_id = auth.uid()
  )
);
