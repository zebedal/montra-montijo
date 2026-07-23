import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { BusinessService } from "@/lib/queries/getBusinessBySlug";

type Props = {
  services: BusinessService[];
};

function formatPrice(service: BusinessService) {
  if (service.price_type === "quote" || service.price === null) {
    return "Sob orçamento";
  }

  const price = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR"
  }).format(service.price);

  return service.price_type === "from" ? `Desde ${price}` : price;
}

export function BusinessServices({ services }: Props) {
  if (services.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Serviços e preços</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((service) => (
            <article key={service.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold leading-6">{service.name}</h3>
                <p className="shrink-0 text-sm font-semibold text-primary">
                  {formatPrice(service)}
                </p>
              </div>
              {service.description && (
                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-muted-foreground">
                  {service.description}
                </p>
              )}
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
