import Image from "next/image";
import Link from "next/link";

import { MapPin, Megaphone, Phone, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessSpecialtyChips } from "@/components/business/BusinessSpecialtyChips";
import { BusinessPlanBadge } from "@/components/business/BusinessPlanBadge";

import type { BusinessSummary } from "@/types/business";

type Props = {
  business: BusinessSummary;
};

export default function BusinessCard({ business }: Props) {
  const cardImageUrl = business.logo_url ?? business.image_url;

  return (
    <Link href={`/negocio/${business.slug}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-xl border bg-muted">
              {cardImageUrl ? (
                <Image
                  src={cardImageUrl}
                  alt={
                    business.logo_url
                      ? `Logótipo de ${business.name}`
                      : `Fotografia de ${business.name}`
                  }
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Store className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-lg font-semibold">
                  {business.name}
                </h3>

                {business.plan !== "free" && (
                  <BusinessPlanBadge plan={business.plan} className="shrink-0 px-3 py-2" />
                )}
              </div>

              {business.category && (
                <p className="mt-1 text-sm text-primary-green">
                  {business.category.name}
                </p>
              )}

              {business.hasActiveCampaign && (
                <Badge variant="secondary" className="mt-2 gap-1 text-primary">
                  <Megaphone className="h-3 w-3" />
                  Campanha disponível
                </Badge>
              )}

              <BusinessSpecialtyChips specialties={business.specialties} />
            </div>
          </div>

          <div className="mt-6 space-y-3 text-sm">
            {business.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />

                <span>{business.phone}</span>
              </div>
            )}

            {(business.street || business.number || business.postal_code) && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />

                <span className="line-clamp-2">
                  {[
                    business.street,
                    business.number,
                    business.postal_code,
                    business.city
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
