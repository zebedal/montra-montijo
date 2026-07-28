alter table public.business_campaigns
drop constraint if exists business_campaigns_business_id_key;

create index if not exists business_campaigns_business_id_index
on public.business_campaigns (business_id);
