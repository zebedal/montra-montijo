import Image from "next/image";
import Link from "next/link";

import { Store } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { BusinessPlanBadge } from "@/components/business/BusinessPlanBadge";

type Props = {
  business: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    plan: "free" | "featured" | "premium";
    category: {
      name: string;
      slug: string;
    } | null;
  };
};

export default function RelatedBusinessCard({ business }: Props) {
  return (
    <Link href={`/negocio/${business.slug}`}>
      <Card className="group h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
        <CardContent className="p-5">
          <div className="flex gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-muted">
              {business.logoUrl ? (
                <Image
                  src={business.logoUrl}
                  alt={business.name}
                  fill
                  sizes="64px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Store className="h-7 w-7 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {business.category && (
                    <p className="inline-flex rounded-full bg-brand-mint px-2.5 py-1 text-xs font-semibold text-primary-light">
                      {business.category.name}
                    </p>
                  )}

                  <h3 className="mt-1 line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary-green">
                    {business.name}
                  </h3>
                </div>

                {business.plan !== "free" && (
                  <BusinessPlanBadge plan={business.plan} className="shrink-0" />
                )}
              </div>

              {business.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {business.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
