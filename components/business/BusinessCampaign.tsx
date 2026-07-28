"use client";

import Image from "next/image";
import { useEffect } from "react";
import { ArrowUpRight, CalendarDays, Megaphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  CAMPAIGN_CTA_LABELS,
  CAMPAIGN_TYPE_LABELS,
  type BusinessCampaign as Campaign
} from "@/lib/business-campaign";
import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";

type Props = {
  campaign: Campaign | null;
  businessId: string;
  whatsappPhone: string | null;
};

export function BusinessCampaign({
  campaign,
  businessId,
  whatsappPhone
}: Props) {
  useEffect(() => {
    if (!campaign) return;

    const storageKey = `business-campaign-view:${campaign.id}`;
    if (sessionStorage.getItem(storageKey)) return;

    const timer = window.setTimeout(() => {
      trackBusinessEvent(businessId, "campaign_view");
      sessionStorage.setItem(storageKey, "true");
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [businessId, campaign]);

  if (!campaign) return null;

  const href =
    campaign.cta_destination === "url"
      ? campaign.cta_url
      : whatsappPhone
        ? `https://wa.me/${whatsappPhone.replace(/\D/g, "")}${campaign.cta_message ? `?text=${encodeURIComponent(campaign.cta_message)}` : ""}`
        : null;

  return (
    <section
      id="campanha"
      className="scroll-mt-24 overflow-hidden rounded-2xl border bg-card shadow-sm"
    >
      <div className="relative aspect-[16/9] w-full">
        <Image
          src={campaign.image_path}
          alt={campaign.title || "Campanha do negócio"}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-5 sm:p-6">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-primary">
          <Megaphone className="h-4 w-4" />
          {CAMPAIGN_TYPE_LABELS[campaign.type]}
        </p>
        {campaign.title && <h2 className="mt-2 text-2xl font-bold">{campaign.title}</h2>}
        {campaign.description && <p className="mt-3 leading-7 text-muted-foreground">{campaign.description}</p>}
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          Disponível até{" "}
          {new Intl.DateTimeFormat("pt-PT").format(
            new Date(`${campaign.ends_on}T12:00:00`)
          )}
        </p>
        {href && campaign.cta_type && (
          <Button asChild size="lg" className="mt-5 w-full sm:w-auto">
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackBusinessEvent(businessId, "campaign_cta_click")
              }
            >
              {CAMPAIGN_CTA_LABELS[campaign.cta_type]}
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </section>
  );
}
