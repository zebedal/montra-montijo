alter table public.businesses
add column if not exists whatsapp_phone text;

comment on column public.businesses.whatsapp_phone is
'Número disponibilizado explicitamente pelo proprietário para contacto via WhatsApp.';
