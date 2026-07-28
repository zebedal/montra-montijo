export const PRIMARY_CTA_TYPES = [
  "book_table",
  "book_service",
  "book_consultation",
  "request_quote",
  "view_menu",
  "order_online",
  "buy_ticket",
  "buy_online",
  "book_visit",
  "check_availability",
  "register",
  "request_information"
] as const;

export type PrimaryCtaType = (typeof PRIMARY_CTA_TYPES)[number];
export type PrimaryCtaDestination = "url" | "whatsapp";

export const PRIMARY_CTA_LABELS: Record<PrimaryCtaType, string> = {
  book_table: "Reservar mesa",
  book_service: "Marcar serviço",
  book_consultation: "Marcar consulta",
  request_quote: "Pedir orçamento",
  view_menu: "Ver menu",
  order_online: "Encomendar",
  buy_ticket: "Comprar bilhete",
  buy_online: "Comprar online",
  book_visit: "Marcar visita",
  check_availability: "Ver disponibilidade",
  register: "Inscrever-me",
  request_information: "Pedir informações"
};

const CATEGORY_SUGGESTIONS: Record<string, PrimaryCtaType[]> = {
  restaurantes: ["book_table", "view_menu", "order_online"],
  beleza: ["book_service", "request_information"],
  "beleza-e-estetica": ["book_service", "request_information"],
  saude: ["book_consultation", "request_information"],
  servicos: ["request_quote", "request_information"],
  eventos: ["buy_ticket", "register"],
  lojas: ["buy_online", "order_online"],
  alojamento: ["check_availability", "request_information"],
  imobiliario: ["book_visit", "request_information"],
  automovel: ["book_service", "request_quote"]
};

export function getPrimaryCtaOptions(categorySlug?: string | null) {
  const suggested = categorySlug
    ? (CATEGORY_SUGGESTIONS[categorySlug] ?? [])
    : [];
  const suggestedSet = new Set<PrimaryCtaType>(suggested);

  return [...suggested, ...PRIMARY_CTA_TYPES.filter((type) => !suggestedSet.has(type))];
}

export function getPrimaryCtaLabel(type?: string | null) {
  return type && PRIMARY_CTA_TYPES.includes(type as PrimaryCtaType)
    ? PRIMARY_CTA_LABELS[type as PrimaryCtaType]
    : null;
}

export function getPrimaryCtaHref({
  destination,
  url,
  whatsappPhone,
  message
}: {
  destination?: string | null;
  url?: string | null;
  whatsappPhone?: string | null;
  message?: string | null;
}) {
  if (destination === "url" && url) return url;

  if (destination === "whatsapp" && whatsappPhone) {
    const digits = whatsappPhone.replace(/\D/g, "");
    if (!digits) return null;

    return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
  }

  return null;
}
