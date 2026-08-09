"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessService } from "@/lib/queries/getBusinessBySlug";
import { ArrowRight, CircleCheckBig } from "lucide-react";

type Props = {
  services: BusinessService[];
  canRequestQuote?: boolean;
};

function formatPrice(service: BusinessService) {
  if (service.price_type === "none") {
    return null;
  }

  if (service.price_type === "quote") {
    return "Sob orçamento";
  }

  if (service.price === null) return null;

  const price = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR"
  }).format(service.price);

  return service.price_type === "from" ? `Desde ${price}` : price;
}

export function BusinessServices({
  services,
  canRequestQuote = false
}: Props) {
  if (services.length === 0) return null;

  const hasPricingInformation = services.some(
    (service) => service.price_type !== "none"
  );

  return (
    <Card
      id="servicos"
      tabIndex={-1}
      className="min-w-0 scroll-mt-32 overflow-hidden outline-none"
    >
      <CardHeader>
        <CardTitle>
          {hasPricingInformation ? "Serviços e preços" : "Serviços"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid items-start gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const formattedPrice = formatPrice(service);

            return (
              <article
                key={service.id}
                className="min-w-0 rounded-2xl bg-muted/40 p-4 ring-1 ring-foreground/5"
              >
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-2.5">
                  <CircleCheckBig className="mt-0.5 size-5 shrink-0 text-green-600" />
                  <h3 className="min-w-0 wrap-anywhere font-semibold leading-6">
                    {service.name}
                  </h3>
                </div>
                {formattedPrice && (
                  <p className="shrink-0 text-sm font-semibold text-primary">
                    {formattedPrice}
                  </p>
                )}
              </div>
              {service.description && (
                <p className="mt-2 pl-7 whitespace-pre-line wrap-anywhere text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              )}
              {canRequestQuote && (
                <button
                  type="button"
                  className="mt-3 ml-7 inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-green-800 transition-colors hover:text-green-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("business:request-quote", {
                        detail: { serviceName: service.name }
                      })
                    );
                  }}
                >
                  Pedir orçamento para este serviço
                  <ArrowRight className="size-3.5" />
                </button>
              )}
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
