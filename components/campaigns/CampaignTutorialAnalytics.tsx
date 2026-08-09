"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics/trackAnalyticsEvent";

export function CampaignTutorialView() {
  useEffect(() => {
    trackAnalyticsEvent("campaign_tutorial_view");
  }, []);

  return null;
}

type CampaignTutorialCtaProps = {
  href: string;
  label: string;
  source: string;
  showArrow?: boolean;
  variant?: "default" | "secondary" | "outline";
  className?: string;
};

export function CampaignTutorialCta({
  href,
  label,
  source,
  showArrow = false,
  variant = "default",
  className
}: CampaignTutorialCtaProps) {
  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <Link
        href={href}
        onClick={() =>
          trackAnalyticsEvent("campaign_tutorial_cta_click", { source })
        }
      >
        {label}
        {showArrow ? <ArrowRight className="h-4 w-4" /> : null}
      </Link>
    </Button>
  );
}
