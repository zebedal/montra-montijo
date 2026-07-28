alter table public.businesses
  add column if not exists primary_cta_enabled boolean not null default false,
  add column if not exists primary_cta_type text,
  add column if not exists primary_cta_destination text,
  add column if not exists primary_cta_url text,
  add column if not exists primary_cta_message text;

alter table public.businesses
  drop constraint if exists businesses_primary_cta_destination_check;

alter table public.businesses
  drop constraint if exists businesses_primary_cta_type_check;

alter table public.businesses
  add constraint businesses_primary_cta_type_check
  check (
    primary_cta_type is null
    or primary_cta_type in (
      'book_table',
      'book_service',
      'book_consultation',
      'request_quote',
      'view_menu',
      'order_online',
      'buy_ticket',
      'buy_online',
      'book_visit',
      'check_availability',
      'register',
      'request_information'
    )
  );

alter table public.businesses
  add constraint businesses_primary_cta_destination_check
  check (
    primary_cta_destination is null
    or primary_cta_destination in ('url', 'whatsapp')
  );

alter table public.business_events
  add column if not exists metadata jsonb not null default '{}'::jsonb;

comment on column public.businesses.primary_cta_type is
'Tipo controlado da ação principal apresentada em negócios Premium.';

comment on column public.business_events.metadata is
'Contexto imutável do evento, como o tipo e texto do CTA no momento do clique.';
