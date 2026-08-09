import type { BusinessEventType } from "@/lib/business-statistics-core";

export type { BusinessEventType } from "@/lib/business-statistics-core";

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
