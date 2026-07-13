import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import BusinessHomeCard from "@/components/business/BusinessHomeCard";
import { Button } from "@/components/ui/button";
import { Routes } from "@/types";
import { PublicBusiness } from "@/types/business";

type Props = {
  businesses: PublicBusiness[];
};

export default function FeaturedBusinesses({ businesses }: Props) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="container bg-muted/30 py-14 sm:py-16 mx-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />

              <p className="text-sm font-semibold uppercase tracking-wide">
                Em destaque
              </p>
            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Negócios que merecem a sua atenção
            </h2>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Descubra alguns dos negócios em destaque na Montra Montijo.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href={Routes.NEGOCIOS}>
              Ver mais negócios
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessHomeCard key={business.id} business={business} />
          ))}
        </div>
      </div>
    </section>
  );
}
