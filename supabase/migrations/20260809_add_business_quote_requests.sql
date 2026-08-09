create table if not exists public.business_quote_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  requester_name text not null check (char_length(requester_name) between 2 and 120),
  requester_phone text check (requester_phone is null or char_length(requester_phone) <= 30),
  requester_email text check (requester_email is null or char_length(requester_email) <= 160),
  service text check (service is null or char_length(service) between 2 and 160),
  description text not null check (char_length(description) between 10 and 1200),
  locality text not null check (char_length(locality) between 2 and 120),
  timing text not null check (
    timing in ('as_soon_as_possible', 'this_week', 'this_month', 'flexible')
  ),
  status text not null default 'new' check (
    status in ('new', 'contacted', 'quoted', 'completed', 'archived')
  ),
  requester_ip_hash text,
  notification_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists business_quote_requests_owner_created_idx
on public.business_quote_requests (owner_user_id, created_at desc);

create index if not exists business_quote_requests_business_created_idx
on public.business_quote_requests (business_id, created_at desc);

create index if not exists business_quote_requests_rate_limit_idx
on public.business_quote_requests (business_id, requester_ip_hash, created_at desc);

alter table public.business_quote_requests enable row level security;

drop policy if exists "Proprietários podem consultar pedidos de orçamento"
on public.business_quote_requests;
drop policy if exists "Proprietários podem atualizar pedidos de orçamento"
on public.business_quote_requests;

create policy "Proprietários podem consultar pedidos de orçamento"
on public.business_quote_requests for select
to authenticated
using (owner_user_id = auth.uid());

create policy "Proprietários podem atualizar pedidos de orçamento"
on public.business_quote_requests for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

comment on table public.business_quote_requests is
  'Pedidos de orçamento enviados a partir das páginas públicas dos negócios.';

comment on column public.business_quote_requests.requester_ip_hash is
  'Hash irreversível usado exclusivamente para limitação de spam.';
