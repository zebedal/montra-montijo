alter table public.business_hours enable row level security;

drop policy if exists "Horários de negócios visíveis são públicos"
on public.business_hours;

create policy "Horários de negócios visíveis são públicos"
on public.business_hours
for select
using (
  exists (
    select 1
    from public.businesses
    where businesses.id = business_hours.business_id
      and businesses.is_visible = true
  )
);

notify pgrst, 'reload schema';
