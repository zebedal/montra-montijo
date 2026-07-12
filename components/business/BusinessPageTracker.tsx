"use client";

import { useEffect } from "react";

import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";

type Props = {
  businessId: string;
};

const VIEW_DELAY_MS = 3000;

export function BusinessPageTracker({ businessId }: Props) {
  useEffect(() => {
    const storageKey = `business-page-view:${businessId}`;

    const alreadyTracked = sessionStorage.getItem(storageKey);

    if (alreadyTracked) {
      return;
    }

    const timer = window.setTimeout(() => {
      trackBusinessEvent(businessId, "page_view");

      sessionStorage.setItem(storageKey, "true");
    }, VIEW_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [businessId]);

  return null;
}
