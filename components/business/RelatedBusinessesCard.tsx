import Image from "next/image";
import Link from "next/link";

import { Crown, Store } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  business: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    plan: "free" | "premium";
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
                    <p className="inline-flex rounded-full bg-[#EAF3EE] px-2.5 py-1 text-xs font-semibold text-primary-light">
                      {business.category.name}
                    </p>
                  )}

                  <h3 className="mt-1 line-clamp-2 text-base font-semibold transition-colors group-hover:text-primary-green">
                    {business.name}
                  </h3>
                </div>

                {business.plan === "premium" && (
                  <Badge className="shrink-0 bg-yellow-600 text-white hover:bg-yellow-600">
                    <Crown className="mr-1 h-3 w-3" />
                    Premium
                  </Badge>
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
