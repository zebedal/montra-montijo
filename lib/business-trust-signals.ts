export type BusinessTrustSignalId =
  | "owner_managed"
  | "updated"
  | "whatsapp"
  | "always_open"
  | "at_customer_location"
  | "quote_requests";

export type BusinessTrustSignal = {
  id: BusinessTrustSignalId;
  label: string;
};

type BusinessTrustSignalOptions = {
  managedByOwner: boolean;
  updatedAt?: string | null;
  hasWhatsApp: boolean;
  is24Hours: boolean;
  servesAtCustomerLocation: boolean;
  acceptsQuoteRequests: boolean;
};

function formatUpdatedAt(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("pt-PT", {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Lisbon"
  }).format(date);
}

export function getBusinessTrustSignals({
  managedByOwner,
  updatedAt,
  hasWhatsApp,
  is24Hours,
  servesAtCustomerLocation,
  acceptsQuoteRequests
}: BusinessTrustSignalOptions): BusinessTrustSignal[] {
  const signals: BusinessTrustSignal[] = [];

  if (managedByOwner) {
    signals.push({
      id: "owner_managed",
      label: "Página gerida pelo proprietário"
    });
  }

  const updatedLabel = updatedAt ? formatUpdatedAt(updatedAt) : null;
  if (updatedLabel) {
    signals.push({
      id: "updated",
      label: `Informação atualizada em ${updatedLabel}`
    });
  }

  if (hasWhatsApp) {
    signals.push({ id: "whatsapp", label: "Responde por WhatsApp" });
  }

  if (is24Hours) {
    signals.push({ id: "always_open", label: "Disponível 24 horas" });
  }

  if (servesAtCustomerLocation) {
    signals.push({
      id: "at_customer_location",
      label: "Presta serviços ao domicílio"
    });
  }

  if (acceptsQuoteRequests) {
    signals.push({
      id: "quote_requests",
      label: "Aceita pedidos de orçamento"
    });
  }

  return signals;
}
