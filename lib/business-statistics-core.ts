export const BUSINESS_EVENT_TYPES = [
  "page_view",
  "phone_click",
  "email_click",
  "website_click",
  "instagram_click",
  "facebook_click",
  "directions_click",
  "primary_cta_click",
  "campaign_view",
  "campaign_click",
  "campaign_cta_click"
] as const;

export type BusinessEventType = (typeof BUSINESS_EVENT_TYPES)[number];

export type BusinessEventTotals = {
  pageViews: number;
  phoneClicks: number;
  emailClicks: number;
  websiteClicks: number;
  instagramClicks: number;
  facebookClicks: number;
  directionsClicks: number;
  primaryCtaClicks: number;
  campaignCtaClicks: number;
  campaignViews: number;
  campaignClicks: number;
  quoteRequests: number;
  interactions: number;
};

const EVENT_TO_TOTAL_KEY: Record<
  Exclude<BusinessEventType, "page_view" | "campaign_view">,
  Exclude<keyof BusinessEventTotals, "pageViews" | "campaignViews" | "quoteRequests" | "interactions">
> = {
  phone_click: "phoneClicks",
  email_click: "emailClicks",
  website_click: "websiteClicks",
  instagram_click: "instagramClicks",
  facebook_click: "facebookClicks",
  directions_click: "directionsClicks",
  primary_cta_click: "primaryCtaClicks",
  campaign_click: "campaignClicks",
  campaign_cta_click: "campaignCtaClicks"
};

export function createEmptyBusinessEventTotals(): BusinessEventTotals {
  return {
    pageViews: 0,
    phoneClicks: 0,
    emailClicks: 0,
    websiteClicks: 0,
    instagramClicks: 0,
    facebookClicks: 0,
    directionsClicks: 0,
    primaryCtaClicks: 0,
    campaignCtaClicks: 0,
    campaignViews: 0,
    campaignClicks: 0,
    quoteRequests: 0,
    interactions: 0
  };
}

export function calculateBusinessEventTotals(
  events: { event_type: BusinessEventType }[]
) {
  const totals = createEmptyBusinessEventTotals();

  events.forEach((event) => {
    if (event.event_type === "page_view") {
      totals.pageViews += 1;
      return;
    }

    if (event.event_type === "campaign_view") {
      totals.campaignViews += 1;
      return;
    }

    totals[EVENT_TO_TOTAL_KEY[event.event_type]] += 1;
    totals.interactions += 1;
  });

  return totals;
}
