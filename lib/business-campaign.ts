export const CAMPAIGN_TYPES = [
  "offer",
  "promotion",
  "news",
  "event",
  "special_menu",
  "registration"
] as const;

export type CampaignType = (typeof CAMPAIGN_TYPES)[number];

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  offer: "Oferta",
  promotion: "Promoção",
  news: "Novidade",
  event: "Evento",
  special_menu: "Menu especial",
  registration: "Inscrições abertas"
};

export const CAMPAIGN_CTA_TYPES = [
  "claim_offer",
  "learn_more",
  "reserve",
  "book",
  "buy",
  "order",
  "register",
  "view_menu",
  "buy_ticket",
  "check_availability"
] as const;

export type CampaignCtaType = (typeof CAMPAIGN_CTA_TYPES)[number];

export const CAMPAIGN_CTA_LABELS: Record<CampaignCtaType, string> = {
  claim_offer: "Aproveitar promoção",
  learn_more: "Saber mais",
  reserve: "Reservar",
  book: "Marcar",
  buy: "Comprar",
  order: "Encomendar",
  register: "Inscrever-me",
  view_menu: "Ver menu",
  buy_ticket: "Comprar bilhete",
  check_availability: "Ver disponibilidade"
};

export type BusinessCampaign = {
  id: string;
  business_id: string;
  type: CampaignType;
  title: string | null;
  description: string | null;
  image_path: string;
  starts_on: string;
  ends_on: string;
  cta_type: CampaignCtaType | null;
  cta_destination: "url" | "whatsapp" | null;
  cta_url: string | null;
  cta_message: string | null;
  is_active: boolean;
};

export function isCampaignCurrentlyActive(
  campaign?: Pick<BusinessCampaign, "is_active" | "starts_on" | "ends_on"> | null,
  today = new Date().toISOString().slice(0, 10)
) {
  return Boolean(
    campaign?.is_active &&
      campaign.starts_on <= today &&
      campaign.ends_on >= today
  );
}
