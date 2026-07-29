"use client";

import Image from "next/image";
import Link from "next/link";

import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  MapPin,
  Megaphone,
  Sparkles
} from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

import type { PublicBusiness } from "@/types/business";
import { Routes } from "@/types";
import { BusinessSpecialtyChips } from "@/components/business/BusinessSpecialtyChips";

type Props = {
  businesses: PublicBusiness[];
};

export default function NewBusinesses({ businesses }: Props) {
  const hasBusinesses = businesses?.length > 0;
  const latestBusiness = businesses?.[0];
  const remainingBusinesses = businesses?.slice(1) ?? [];
  const reduceMotion = useReducedMotion();
  const viewportAnimation = reduceMotion
    ? { initial: false as const }
    : {
        initial: { opacity: 0, y: 38, scale: 0.95 },
        whileInView: { opacity: 1, y: 0, scale: 1 },
        viewport: { once: true, amount: 0.15 }
      };

  return (
    <section className="bg-background">
      <PageContainer className="pb-16 pt-10 sm:pb-20 sm:pt-12">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
          {...viewportAnimation}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
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
        </motion.div>

        {hasBusinesses ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-12">
            {latestBusiness && (
              <motion.div
                key={latestBusiness.id}
                className="min-w-0 md:col-span-1 lg:col-span-5"
                {...viewportAnimation}
                whileHover={reduceMotion ? undefined : { y: -9, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.995 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  y: { type: "spring", stiffness: 260, damping: 24 }
                }}
              >
                <Link
                  href={`/negocio/${latestBusiness.slug}`}
                  className="group flex h-full min-h-[420px] min-w-0 flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/25 hover:shadow-xl"
                >
                  <div className="relative h-52 shrink-0 overflow-hidden bg-muted sm:h-60 lg:h-56">
                    {latestBusiness.imageUrl || latestBusiness.logoUrl ? (
                      <Image
                        src={latestBusiness.imageUrl ?? latestBusiness.logoUrl!}
                        alt={
                          latestBusiness.imageUrl
                            ? `Fotografia de ${latestBusiness.name}`
                            : `Logótipo de ${latestBusiness.name}`
                        }
                        fill
                        sizes="(max-width: 1024px) 100vw, 42vw"
                        className={`${latestBusiness.imageUrl ? "object-cover" : "bg-white object-contain p-12"} transition-transform duration-700 group-hover:scale-[1.035]`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[#EAF3EE]">
                        <Building2 className="h-14 w-14 text-primary/25" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-2 p-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/95 px-3 py-1.5 text-xs font-semibold text-green-950 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Acabado de chegar
                      </span>
                      {latestBusiness.hasActiveCampaign && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                          <Megaphone className="h-3.5 w-3.5" /> Oferta
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    {latestBusiness.category && (
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-light">
                        {latestBusiness.category.name}
                      </p>
                    )}
                    <h3 className="mt-2 text-lg font-semibold leading-tight tracking-tight sm:text-xl">
                      {latestBusiness.name}
                    </h3>
                    {latestBusiness.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {latestBusiness.description}
                      </p>
                    )}
                    <div className="mt-auto flex items-center justify-between gap-4 pt-5 text-sm">
                      {latestBusiness.city ? (
                        <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="truncate">{latestBusiness.city}</span>
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="shrink-0 font-semibold">
                        Ver negócio
                        <ArrowRight className="ml-1 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            <div className="grid min-w-0 gap-4 sm:grid-cols-2 md:contents lg:col-span-7 lg:grid">
              {remainingBusinesses.map((business, index) => {
                const spansFullRow =
                  remainingBusinesses.length % 2 === 1 &&
                  index === remainingBusinesses.length - 1;

                return (
                  <div
                    key={business.id}
                    className={spansFullRow ? "h-full min-w-0 lg:col-span-2" : "h-full min-w-0"}
                  >
                  <BusinessTile
                    business={business}
                    index={index}
                    reduceMotion={reduceMotion}
                    viewportAnimation={viewportAnimation}
                  />
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <motion.div
            className="mt-10 rounded-3xl border border-dashed bg-muted/30 px-6 py-14 text-center sm:px-8"
            {...viewportAnimation}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
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
          </motion.div>
        )}
      </PageContainer>
    </section>
  );
}

type BusinessTileProps = {
  business: PublicBusiness;
  index: number;
  reduceMotion: boolean | null;
  viewportAnimation:
    | { initial: false }
    | {
        initial: { opacity: number; y: number; scale: number };
        whileInView: { opacity: number; y: number; scale: number };
        viewport: { once: boolean; amount: number };
      };
};

function BusinessTile({
  business,
  index,
  reduceMotion,
  viewportAnimation
}: BusinessTileProps) {
  return (
    <motion.div
      className="h-full min-w-0"
      {...viewportAnimation}
      whileHover={reduceMotion ? undefined : { y: -8, scale: 1.02 }}
      whileTap={reduceMotion ? undefined : { scale: 0.992 }}
      transition={{
        delay: reduceMotion ? 0 : Math.min((index + 1) * 0.1, 0.5),
        duration: 0.68,
        ease: [0.22, 1, 0.36, 1],
        scale: { type: "spring", stiffness: 340, damping: 25 },
        y: { type: "spring", stiffness: 280, damping: 24 }
      }}
    >
      <Link
        href={`/negocio/${business.slug}`}
        className="group flex h-full min-h-[150px] min-w-0 items-center gap-4 overflow-hidden rounded-2xl border bg-card p-4 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/30 hover:shadow-lg lg:min-h-0"
      >
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                    {business.logoUrl || business.imageUrl ? (
                      <Image
                        src={business.logoUrl ?? business.imageUrl!}
                        alt={
                          business.logoUrl
                            ? `Logótipo de ${business.name}`
                            : `Fotografia de ${business.name}`
                        }
                        fill
                        sizes="112px"
                        className={`${business.logoUrl ? "bg-white object-contain p-3" : "object-cover"} transition-transform duration-500 group-hover:scale-105`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Building2 className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {business.category && (
                        <p className="inline-flex rounded-full bg-[#EAF3EE] px-2 py-0.5 text-[10px] font-semibold leading-4 text-primary-light">
                          {business.category.name}
                        </p>
                      )}
                      {business.hasActiveCampaign && (
                        <Megaphone className="h-4 w-4 text-primary" aria-label="Oferta disponível" />
                      )}
                    </div>

                    <h3 className="mt-2 line-clamp-2 text-[15px] font-semibold leading-snug transition-colors group-hover:text-primary sm:text-base">
                      {business.name}
                    </h3>

                    <BusinessSpecialtyChips
                      specialties={business.specialties}
                      className="mt-2 hidden flex-wrap gap-1 sm:flex [&_[data-slot=badge]]:h-4 [&_[data-slot=badge]]:px-1.5 [&_[data-slot=badge]]:py-0 [&_[data-slot=badge]]:text-[10px]"
                    />

                    {business.city && (
                      <div className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 shrink-0" />
                        <span className="truncate">{business.city}</span>
                      </div>
                    )}
                  </div>

                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:translate-x-1 group-hover:text-primary sm:block" />
      </Link>
    </motion.div>
  );
}
