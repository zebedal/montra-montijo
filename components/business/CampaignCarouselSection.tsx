"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, Megaphone } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem
} from "@/components/ui/carousel";
import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";
import { CAMPAIGN_TYPE_LABELS, type CampaignType } from "@/lib/business-campaign";
import { cn } from "@/lib/utils";

export type CampaignCarouselItem = {
  id: string;
  title: string | null;
  description: string | null;
  type: CampaignType;
  imageUrl: string;
  endsOn: string;
  businessName: string;
  businessSlug: string;
  businessId: string;
};

export function CampaignCarouselSection({
  campaigns
}: {
  campaigns: CampaignCarouselItem[];
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const updateCurrent = useCallback((carouselApi: CarouselApi) => {
    if (carouselApi) setCurrent(carouselApi.selectedScrollSnap());
  }, []);

  const handleApi = useCallback((carouselApi: CarouselApi) => {
    setApi(carouselApi);
    if (carouselApi) setCurrent(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", updateCurrent);
    api.on("reInit", updateCurrent);
    return () => {
      api.off("select", updateCurrent);
      api.off("reInit", updateCurrent);
    };
  }, [api, updateCurrent]);

  if (campaigns.length === 0) return null;

  const hasNavigation = campaigns.length > 1;

  return (
    <section className="overflow-hidden border-y border-white/5 bg-[radial-gradient(circle_at_12%_0%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(145deg,#071512_0%,#0b1715_48%,#07100f_100%)] text-white">
      <PageContainer className="py-16 sm:py-20">
        <div className="mb-8 flex items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">
              <Megaphone className="h-4 w-4" /> Por tempo limitado
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Ofertas e novidades no Montijo
            </h2>
            <p className="mt-3 text-base leading-7 text-white/65">
              Encontre promoções, eventos e novidades dos negócios locais do Montijo.
            </p>
          </div>

          {hasNavigation && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <Button type="button" size="icon" variant="outline" onClick={() => api?.scrollPrev()} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" aria-label="Campanha anterior">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button type="button" size="icon" variant="outline" onClick={() => api?.scrollNext()} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" aria-label="Campanha seguinte">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        <Carousel setApi={handleApi} opts={{ align: "start", loop: hasNavigation }} className="w-full overflow-visible">
          <CarouselContent className="-ml-4 overflow-visible">
            {campaigns.map((campaign, index) => (
              <CarouselItem key={campaign.id} className="basis-[88%] pl-4 sm:basis-[76%] lg:basis-[62%] xl:basis-[56%]">
                <motion.article
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.16) }}
                  className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-[#10201d] shadow-2xl shadow-black/25"
                >
                  <div className="grid h-full md:grid-cols-[1.08fr_0.92fr]">
                    <Link
                      href={`/negocio/${campaign.businessSlug}#campanha`}
                      onClick={() => trackBusinessEvent(campaign.businessId, "campaign_click")}
                      className="relative aspect-[16/10] min-h-[230px] overflow-hidden bg-black/20 md:aspect-auto md:min-h-[410px]"
                      aria-label={`Ver campanha de ${campaign.businessName}`}
                    >
                      <Image
                        src={campaign.imageUrl}
                        alt={campaign.title || `Campanha de ${campaign.businessName}`}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1280px) 32vw, (min-width: 768px) 44vw, 80vw"
                        className="object-cover transition duration-700 group-hover:scale-[1.035]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                    </Link>

                    <div className="flex min-w-0 flex-col p-6 sm:p-7 md:min-h-[410px]">
                      <Badge className="w-fit border-white/15 bg-white/10 text-white hover:bg-white/10">
                        {CAMPAIGN_TYPE_LABELS[campaign.type]}
                      </Badge>
                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300">
                        {campaign.businessName}
                      </p>
                      {campaign.title && (
                        <h3 className="mt-2 line-clamp-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                          {campaign.title}
                        </h3>
                      )}
                      {campaign.description && (
                        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">
                          {campaign.description}
                        </p>
                      )}
                      <div className="mt-auto pt-6">
                        <p className="flex items-center gap-2 text-xs text-white/55">
                          <CalendarDays className="h-4 w-4" />
                          Até {new Intl.DateTimeFormat("pt-PT").format(new Date(`${campaign.endsOn}T12:00:00`))}
                        </p>
                        <Button asChild className="mt-4 bg-white text-green-950 hover:bg-emerald-50">
                          <Link href={`/negocio/${campaign.businessSlug}#campanha`} onClick={() => trackBusinessEvent(campaign.businessId, "campaign_click")}>
                            Ver campanha <ArrowUpRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {hasNavigation && (
          <div className="mt-7 flex items-center justify-between gap-5">
            <div className="flex flex-wrap items-center gap-2" aria-label="Selecionar campanha">
              {campaigns.map((campaign, index) => (
                <button
                  key={campaign.id}
                  type="button"
                  onClick={() => api?.scrollTo(index)}
                  className={cn("h-2 rounded-full transition-all", current === index ? "w-8 bg-emerald-300" : "w-2 bg-white/25 hover:bg-white/50")}
                  aria-label={`Ir para a campanha ${index + 1}`}
                  aria-current={current === index ? "true" : undefined}
                />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm tabular-nums text-white/55">
                {String(current + 1).padStart(2, "0")} / {String(campaigns.length).padStart(2, "0")}
              </span>
              <div className="flex gap-2 sm:hidden">
                <Button type="button" size="icon-sm" variant="outline" onClick={() => api?.scrollPrev()} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" aria-label="Campanha anterior"><ChevronLeft /></Button>
                <Button type="button" size="icon-sm" variant="outline" onClick={() => api?.scrollNext()} className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white" aria-label="Campanha seguinte"><ChevronRight /></Button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </section>
  );
}
