"use client";

import { ArrowUpRight, MousePointerClick } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  getPrimaryCtaHref,
  getPrimaryCtaLabel
} from "@/lib/business-primary-cta";
import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";

type Props = {
  business: {
    id: string;
    plan: "free" | "premium";
    whatsapp_phone: string | null;
    primary_cta_enabled: boolean;
    primary_cta_type: string | null;
    primary_cta_destination: string | null;
    primary_cta_url: string | null;
    primary_cta_message: string | null;
  };
};

export function BusinessPrimaryCta({ business }: Props) {
  if (business.plan !== "premium" || !business.primary_cta_enabled) {
    return null;
  }

  const label = getPrimaryCtaLabel(business.primary_cta_type);
  const href = getPrimaryCtaHref({
    destination: business.primary_cta_destination,
    url: business.primary_cta_url,
    whatsappPhone: business.whatsapp_phone,
    message: business.primary_cta_message
  });

  if (!label || !href) return null;

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <p className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <MousePointerClick className="h-4 w-4 text-primary" />
        Ação principal
      </p>
      <Button asChild size="lg" className="w-full text-base">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackBusinessEvent(business.id, "primary_cta_click")}
        >
          {label}
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}
