import {
  BadgeCheck,
  CalendarCheck2,
  Clock3,
  FileText,
  House,
  MessageCircle
} from "lucide-react";

import type {
  BusinessTrustSignal,
  BusinessTrustSignalId
} from "@/lib/business-trust-signals";

const signalIcons: Record<BusinessTrustSignalId, typeof BadgeCheck> = {
  owner_managed: BadgeCheck,
  updated: CalendarCheck2,
  whatsapp: MessageCircle,
  always_open: Clock3,
  at_customer_location: House,
  quote_requests: FileText
};

export function BusinessTrustSignals({
  signals
}: {
  signals: BusinessTrustSignal[];
}) {
  if (signals.length === 0) return null;

  return (
    <div aria-label="Sinais de confiança" className="flex flex-wrap gap-2 pt-1">
      {signals.map((signal) => {
        const Icon = signalIcons[signal.id];

        return (
          <span
            key={signal.id}
            className="inline-flex min-h-8 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium leading-5 text-green-900"
          >
            <Icon className="size-3.5 shrink-0 text-green-700" aria-hidden="true" />
            {signal.label}
          </span>
        );
      })}
    </div>
  );
}
