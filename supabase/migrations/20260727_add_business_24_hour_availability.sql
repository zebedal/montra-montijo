alter table public.businesses
add column if not exists is_24_hours boolean not null default false;
