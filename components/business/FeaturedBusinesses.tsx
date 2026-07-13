import Link from "next/link";
import { ArrowRight, Crown } from "lucide-react";

import BusinessHomeCard from "@/components/business/BusinessHomeCard";
import { Button } from "@/components/ui/button";

import { PublicBusiness } from "@/types/business";
import PageContainer from "../PageContainer";

type Props = {
  businesses: PublicBusiness[];
};

export default function FeaturedBusinesses({ businesses }: Props) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section>
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Crown className="h-3.5 w-3.5" />
              Seleção Premium
            </div>

            <h2 className="mt-4 text-3xl font-bold tracking-tight">
              Negócios em destaque
            </h2>

            <p className="mt-2 max-w-2xl text-muted-foreground">
              Conheça alguns dos negócios Premium em destaque na Montra Montijo.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/negocios">
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
      </PageContainer>
    </section>
  );
}
