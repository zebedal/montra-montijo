import Link from "next/link";
import Image from "next/image";
import { Building2, ExternalLink, MapPin, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BusinessSummary } from "@/types/business";

type Props = {
  business: BusinessSummary;
};

export default function MyBusinessCard({ business }: Props) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-6 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border bg-muted">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={business.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{business.name}</h2>

              <Badge
                variant={business.plan === "premium" ? "default" : "secondary"}
              >
                {business.plan === "premium" ? "Premium" : "Gratuito"}
              </Badge>
            </div>

            {business.category && (
              <p className="text-sm text-muted-foreground">
                {business.category.name}
              </p>
            )}

            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />

              <span>{business.city}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 md:ml-auto">
          <Button asChild variant="outline">
            <Link href={`/negocio/${business.id}`}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Ver página
            </Link>
          </Button>

          <Button asChild>
            <Link href={`/area-cliente/negocio/${business.id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
