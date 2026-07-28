alter table public.business_campaigns
drop constraint if exists business_campaigns_type_check;

alter table public.business_campaigns
add constraint business_campaigns_type_check
check (
  type in (
    'offer',
    'promotion',
    'news',
    'event',
    'special_menu',
    'registration'
  )
);
