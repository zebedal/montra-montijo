alter table public.businesses
drop constraint if exists businesses_plan_check;

update public.businesses
set plan = 'featured'
where plan = 'premium';

alter table public.businesses
add constraint businesses_plan_check
check (plan in ('free', 'featured', 'premium'));

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
