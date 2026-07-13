import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PublicBusiness } from "@/types/business";
import RelatedBusinessesCard from "./RelatedBusinessesCard";

type Props = {
  businesses: PublicBusiness[];
  categoryName: string;
  categorySlug: string;
};

export default function RelatedBusinesses({
  businesses,
  categoryName,
  categorySlug
}: Props) {
  if (businesses.length === 0) {
    return null;
  }

  return (
    <section className="border-t pt-10 sm:pt-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Mais opções no Montijo
          </p>

          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Negócios semelhantes
          </h2>

          <p className="mt-2 text-muted-foreground">
            Descubra outros negócios da categoria {categoryName}.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/categorias/${categorySlug}`}>
            Ver toda a categoria
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {businesses.map((business) => (
          <RelatedBusinessesCard key={business.id} business={business} />
        ))}
      </div>
    </section>
  );
}
