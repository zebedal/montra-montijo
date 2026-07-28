"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Megaphone } from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { CAMPAIGN_TYPE_LABELS, type CampaignType } from "@/lib/business-campaign";
import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";

export type HomeCampaign = {
  id: string;
  title: string | null;
  type: CampaignType;
  imageUrl: string;
  endsOn: string;
  businessName: string;
  businessSlug: string;
  businessId: string;
};

export function HomeCampaigns({ campaigns }: { campaigns: HomeCampaign[] }) {
  if (campaigns.length === 0) return null;

  return (
    <section className="border-y bg-muted/20 py-16 sm:py-20">
      <PageContainer>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
              <Megaphone className="h-4 w-4" /> Campanhas locais
            </p>
            <h2 className="mt-2 text-3xl font-bold">Ofertas no comércio local</h2>
            <p className="mt-2 text-muted-foreground">
              Descubra promoções, novidades e experiências disponíveis por tempo limitado.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Link key={campaign.id} href={`/negocio/${campaign.businessSlug}#campanha`} onClick={() => trackBusinessEvent(campaign.businessId, "campaign_click")} className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <div className="relative aspect-[16/9]">
                <Image src={campaign.imageUrl} alt={campaign.title || `Campanha de ${campaign.businessName}`} fill className="object-cover transition duration-300 group-hover:scale-105" />
                <Badge className="absolute left-3 top-3">{CAMPAIGN_TYPE_LABELS[campaign.type]}</Badge>
              </div>
              <div className="p-5">
                <p className="text-sm text-muted-foreground">{campaign.businessName}</p>
                {campaign.title && <h3 className="mt-1 line-clamp-2 text-lg font-semibold">{campaign.title}</h3>}
                <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> Até {new Intl.DateTimeFormat("pt-PT").format(new Date(`${campaign.endsOn}T12:00:00`))}
                </p>
                <span className="mt-3 inline-flex items-center text-sm font-medium text-primary">
                  Ver campanha <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}
