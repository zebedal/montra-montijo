import Image from "next/image";
import Link from "next/link";

import { ArrowRight, Building2, MapPin } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

import type { PublicBusiness } from "@/types/business";
import { Routes } from "@/types";

type Props = {
  businesses: PublicBusiness[];
};

export default function NewBusinesses({ businesses }: Props) {
  const hasBusinesses = businesses?.length > 0;

  return (
    <section className="bg-background">
      <PageContainer className="py-16 sm:py-20">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Adicionados recentemente
            </p>

            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Novos negócios
            </h2>

            <p className="mt-3 max-w-2xl text-muted-foreground">
              Conheça os negócios que chegaram recentemente à Montra Montijo.
            </p>
          </div>

          {hasBusinesses && (
            <Button asChild variant="outline">
              <Link href="/negocios">
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {hasBusinesses ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {businesses.map((business) => (
              <Link
                key={business.id}
                href={`/negocio/${business.slug}`}
                className="group flex min-w-0 items-center gap-4 rounded-2xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {business.logoUrl ? (
                    <Image
                      src={business.logoUrl}
                      alt={`Logótipo de ${business.name}`}
                      fill
                      sizes="80px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {business.category && (
                    <p className="truncate text-xs font-semibold uppercase tracking-wide text-primary-green">
                      {business.category.name}
                    </p>
                  )}

                  <h3 className="mt-1 truncate text-lg font-semibold transition-colors group-hover:text-primary">
                    {business.name}
                  </h3>

                  {business.description && (
                    <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
                      {business.description}
                    </p>
                  )}

                  {business.city && (
                    <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />

                      <span className="truncate">{business.city}</span>
                    </div>
                  )}
                </div>

                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed bg-muted/30 px-6 py-14 text-center sm:px-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>

            <h3 className="mt-6 text-xl font-semibold">
              Em breve haverá novidades
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              Ainda não existem novos negócios para apresentar. Entretanto,
              explore os negócios disponíveis ou descubra as categorias da
              Montra Montijo.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href={Routes.CRIAR_NEGOCIO}>
                  Adicionar negócio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline">
                <Link href="/categorias">Ver categorias</Link>
              </Button>
            </div>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
