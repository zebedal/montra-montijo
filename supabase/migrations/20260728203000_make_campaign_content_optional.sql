alter table public.business_campaigns
  alter column title drop not null,
  alter column description drop not null,
  alter column cta_type drop not null,
  alter column cta_destination drop not null;

alter table public.business_campaigns
  drop constraint if exists business_campaigns_title_check,
  drop constraint if exists business_campaigns_description_check,
  drop constraint if exists business_campaigns_cta_type_check,
  drop constraint if exists business_campaigns_cta_destination_check,
  drop constraint if exists business_campaigns_check;

alter table public.business_campaigns
  add constraint business_campaigns_title_check
    check (title is null or char_length(title) between 3 and 90),
  add constraint business_campaigns_description_check
    check (description is null or char_length(description) between 10 and 300),
  add constraint business_campaigns_cta_type_check
    check (cta_type is null or cta_type in ('claim_offer', 'learn_more', 'reserve', 'book', 'buy', 'order', 'register', 'view_menu', 'buy_ticket', 'check_availability')),
  add constraint business_campaigns_cta_destination_check
    check (cta_destination is null or cta_destination in ('url', 'whatsapp')),
  add constraint business_campaigns_dates_check
    check (ends_on >= starts_on),
  add constraint business_campaigns_cta_consistency_check
    check (
      (cta_type is null and cta_destination is null and cta_url is null and cta_message is null)
      or
      (cta_type is not null and cta_destination = 'url' and cta_url is not null)
      or
      (cta_type is not null and cta_destination = 'whatsapp' and cta_url is null)
    );
