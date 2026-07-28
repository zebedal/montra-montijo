create table if not exists public.business_campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null unique references public.businesses(id) on delete cascade,
  type text not null check (type in ('promotion', 'news', 'event', 'special_menu', 'registration')),
  title text not null check (char_length(title) between 3 and 90),
  description text not null check (char_length(description) between 10 and 300),
  image_path text not null,
  starts_on date not null,
  ends_on date not null,
  cta_type text not null check (cta_type in ('claim_offer', 'learn_more', 'reserve', 'book', 'buy', 'order', 'register', 'view_menu', 'buy_ticket', 'check_availability')),
  cta_destination text not null check (cta_destination in ('url', 'whatsapp')),
  cta_url text,
  cta_message text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  check (
    (cta_destination = 'url' and cta_url is not null)
    or cta_destination = 'whatsapp'
  )
);

alter table public.business_campaigns enable row level security;

drop policy if exists "Public can view active campaigns" on public.business_campaigns;
create policy "Public can view active campaigns"
on public.business_campaigns for select
using (
  is_active = true
  and starts_on <= current_date
  and ends_on >= current_date
  and exists (
    select 1 from public.businesses
    where businesses.id = business_campaigns.business_id
      and businesses.is_visible = true
      and businesses.plan = 'premium'
  )
);

drop policy if exists "Owners can view campaigns" on public.business_campaigns;
create policy "Owners can view campaigns"
on public.business_campaigns for select to authenticated
using (
  exists (
    select 1 from public.businesses
    where businesses.id = business_campaigns.business_id
      and businesses.user_id = auth.uid()
  )
);

create index if not exists business_campaigns_public_index
on public.business_campaigns (is_active, starts_on, ends_on);
