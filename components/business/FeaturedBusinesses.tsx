"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, ChevronLeft, ChevronRight, MapPin, Megaphone, Sparkles } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { BusinessPlanBadge } from "@/components/business/BusinessPlanBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { Routes } from "@/types";
import type { PublicBusiness } from "@/types/business";

type Props = {
  businesses: PublicBusiness[];
};

export default function FeaturedBusinesses({ businesses }: Props) {
  const [api, setApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const updateNavigation = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setCanScrollPrev(carouselApi.canScrollPrev());
    setCanScrollNext(carouselApi.canScrollNext());
  }, []);

  const handleApi = useCallback((carouselApi: CarouselApi) => {
    setApi(carouselApi);
    if (carouselApi) {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    }
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", updateNavigation);
    api.on("reInit", updateNavigation);
    return () => {
      api.off("select", updateNavigation);
      api.off("reInit", updateNavigation);
    };
  }, [api, updateNavigation]);

  if (businesses.length === 0) return null;

  const hasNavigation = businesses.length > 1;

  return (
    <section className="mb-14 overflow-hidden bg-[#f4f7f5] sm:mb-20 lg:mb-24">
      <PageContainer className="py-16 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-green-800 dark:text-green-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 text-amber-800">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
              Escolhas da Montra
            </div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight">Negócios em destaque</h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Descubra espaços, serviços e experiências do comércio local do Montijo.
            </p>
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {hasNavigation && (
              <>
                <Button type="button" size="icon" variant="outline" onClick={() => api?.scrollPrev()} disabled={!canScrollPrev} className="rounded-full border-green-950/10 bg-white shadow-sm" aria-label="Negócio anterior">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button type="button" size="icon" variant="outline" onClick={() => api?.scrollNext()} disabled={!canScrollNext} className="rounded-full border-green-950/10 bg-white shadow-sm" aria-label="Negócio seguinte">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}
            <Button asChild variant="ghost" className="text-green-900 hover:bg-white/70 dark:text-green-200">
              <Link href={Routes.NEGOCIOS}>Ver mais negócios <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>

        <Carousel setApi={handleApi} opts={{ align: "start", dragFree: true }} className="mt-10 w-full overflow-visible">
          <CarouselContent className="-ml-5 overflow-visible">
            {businesses.map((business, index) => {
              const imageUrl = business.imageUrl ?? business.logoUrl;
              const isLogoOnly = !business.imageUrl && Boolean(business.logoUrl);
              return (
                <CarouselItem key={business.id} className="basis-[90%] pl-5 sm:basis-[76%] lg:basis-[62%] xl:basis-[56%]">
                  <motion.article
                    initial={false}
                    whileHover={prefersReducedMotion ? undefined : { y: -5 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="group relative h-[350px] overflow-hidden rounded-[1.75rem] border border-white/80 bg-emerald-950 shadow-[0_22px_55px_rgba(22,65,47,0.14)] sm:h-[390px]"
                  >
                    <Link href={`/negocio/${business.slug}`} className="relative block h-full">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={isLogoOnly ? `Logótipo de ${business.name}` : `Fotografia de ${business.name}`}
                          fill
                          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 76vw, 62vw"
                          className={`${isLogoOnly ? "bg-white object-contain p-14 sm:p-20" : "object-cover"} transition-transform duration-700 group-hover:scale-[1.035]`}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top_right,rgba(110,231,183,0.2),transparent_45%)]">
                          <Building2 className="h-16 w-16 text-emerald-100/35" />
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
                      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 sm:p-5">
                        <div className="flex flex-wrap gap-2">
                          <BusinessPlanBadge plan={business.plan} className="shadow-lg" />
                          {business.hasActiveCampaign && (
                            <Badge className="gap-1 border border-white/30 bg-white/90 text-emerald-950 shadow-lg hover:bg-white/90">
                              <Megaphone className="h-3.5 w-3.5" /> Oferta disponível
                            </Badge>
                          )}
                        </div>
                        <span className="font-mono text-xs tracking-wider text-white/65">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>

                      <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-7">
                        {business.category && (
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                            {business.category.name}
                          </p>
                        )}
                        <h3 className="mt-2 line-clamp-2 text-2xl font-semibold leading-tight sm:text-3xl">
                          {business.name}
                        </h3>
                        {business.description && (
                          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-white/75 sm:text-base">
                            {business.description}
                          </p>
                        )}
                        <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/20 pt-4 text-sm">
                          {business.city ? (
                            <span className="flex min-w-0 items-center gap-1.5 text-white/75">
                              <MapPin className="h-4 w-4 shrink-0" />
                              <span className="truncate">{business.city}</span>
                            </span>
                          ) : <span />}
                          <span className="shrink-0 font-semibold">
                            Ver negócio <ArrowRight className="ml-1 inline h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div className="mt-5 flex items-center justify-between sm:hidden">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => api?.scrollPrev()}
              disabled={!canScrollPrev}
              className="rounded-full border-green-950/10 bg-white shadow-sm"
              aria-label="Negócio anterior"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => api?.scrollNext()}
              disabled={!canScrollNext}
              className="rounded-full border-green-950/10 bg-white shadow-sm"
              aria-label="Negócio seguinte"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <Button asChild variant="ghost" className="text-green-900 hover:bg-white/70">
            <Link href={Routes.NEGOCIOS}>
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
