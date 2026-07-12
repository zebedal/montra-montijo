export type BusinessEventType =
  | "page_view"
  | "phone_click"
  | "email_click"
  | "website_click"
  | "instagram_click"
  | "facebook_click"
  | "directions_click";

export function trackBusinessEvent(
  businessId: string,
  eventType: BusinessEventType
) {
  void fetch("/api/business-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      businessId,
      eventType
    }),
    keepalive: true
  }).catch((error) => {
    console.error("Erro ao registar interação:", error);
  });
}
