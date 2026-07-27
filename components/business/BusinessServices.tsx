import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessService } from "@/lib/queries/getBusinessBySlug";
import { CircleCheckBig } from "lucide-react";

type Props = {
  services: BusinessService[];
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

export function BusinessServices({ services }: Props) {
  if (services.length === 0) return null;

  const hasPricingInformation = services.some(
    (service) => service.price_type !== "none"
  );

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader>
        <CardTitle>
          {hasPricingInformation ? "Serviços e preços" : "Serviços"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => {
            const formattedPrice = formatPrice(service);

            return (
              <article
                key={service.id}
                className="min-w-0 rounded-xl border p-4"
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
              </article>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
