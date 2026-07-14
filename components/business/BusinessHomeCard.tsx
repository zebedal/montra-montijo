import Image from "next/image";
import Link from "next/link";

import { Building2, Crown, MapPin } from "lucide-react";

import FavoriteButton from "@/components/business/FavoriteButton";
import { Badge } from "@/components/ui/badge";

import type { PublicBusiness } from "@/types/business";

type Props = {
  business: PublicBusiness;
  showPremiumBadge?: boolean;
};

export default function BusinessHomeCard({
  business,
  showPremiumBadge = true
}: Props) {
  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <Link
        href={`/negocio/${business.slug}`}
        className="flex h-full min-w-0 flex-col"
      >
        <div className="relative aspect-16/10 overflow-hidden bg-muted">
          {business.logoUrl ? (
            <Image
              src={business.logoUrl}
              alt={`Logótipo de ${business.name}`}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Building2 className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}

          {showPremiumBadge && business.plan === "premium" && (
            <Badge className="absolute left-3 top-3 border-0 bg-yellow-600 py-3 text-white hover:bg-yellow-600">
              <Crown className="mr-1 h-3.5 w-3.5" />
              Premium
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {business.category && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {business.category.name}
            </p>
          )}

          <h2 className="mt-1 line-clamp-1 text-lg font-semibold transition-colors group-hover:text-primary">
            {business.name}
          </h2>

          {business.description && (
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
              {business.description}
            </p>
          )}

          {business.city && (
            <div className="mt-auto flex items-center gap-1.5 pt-4 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0" />

              <span className="truncate">{business.city}</span>
            </div>
          )}
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10">
        <FavoriteButton
          businessId={business.id}
          businessName={business.name}
          businessSlug={business.slug}
          iconOnly
        />
      </div>
    </article>
  );
}
