import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import BusinessHomeCard, {
  type HomeBusiness
} from "@/components/business/BusinessHomeCard";
import { Button } from "@/components/ui/button";

type Props = {
  businesses: HomeBusiness[];
};

export default function NewBusinesses({ businesses }: Props) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-primary">
              <Clock3 className="h-5 w-5" />

              <p className="text-sm font-semibold uppercase tracking-wide">
                Novidades
              </p>
            </div>

            <h2 className="mt-2 text-3xl font-bold tracking-tight">
              Novos negócios na Montra
            </h2>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Conheça os negócios que chegaram mais recentemente à plataforma.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/search?q=montijo">
              Explorar negócios
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <BusinessHomeCard
              key={business.id}
              business={business}
              showPremiumBadge
            />
          ))}
        </div>
      </div>
    </section>
  );
}
