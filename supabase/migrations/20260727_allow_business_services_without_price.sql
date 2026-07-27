alter table public.business_services
drop constraint if exists business_services_price_type_check;

alter table public.business_services
drop constraint if exists business_services_check;

alter table public.business_services
drop constraint if exists business_services_price_consistency_check;

alter table public.business_services
add constraint business_services_price_type_check
check (price_type in ('none', 'fixed', 'from', 'quote'));

alter table public.business_services
add constraint business_services_price_consistency_check
check (
  (price_type in ('none', 'quote') and price is null)
  or (price_type in ('fixed', 'from') and price is not null)
);
