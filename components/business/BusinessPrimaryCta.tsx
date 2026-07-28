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
    plan: "free" | "featured" | "premium";
    whatsapp_phone: string | null;
    primary_cta_enabled: boolean;
    primary_cta_type: string | null;
    primary_cta_destination: string | null;
    primary_cta_url: string | null;
    primary_cta_message: string | null;
  };
};

export function BusinessPrimaryCta({ business }: Props) {
  if (business.plan === "free" || !business.primary_cta_enabled) {
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
    <div className="flex flex-col gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <MousePointerClick className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Ação principal
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Avance diretamente para o próximo passo.
          </p>
        </div>
      </div>

      <Button
        asChild
        size="lg"
        className="w-full shrink-0 text-base sm:w-auto sm:min-w-52"
      >
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
