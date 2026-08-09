"use client";

type AnalyticsValue = string | number | boolean | undefined;

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, AnalyticsValue>
    ) => void;
  }
}

export function trackAnalyticsEvent(
  eventName: string,
  params?: Record<string, AnalyticsValue>
) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}
