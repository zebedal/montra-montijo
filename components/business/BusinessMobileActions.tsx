"use client";

import { Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { trackBusinessEvent } from "@/lib/analytics/trackBusinessEvent";
import { getBusinessWhatsAppUrl } from "@/lib/business-contact";

type Props = {
  businessId: string;
  businessName: string;
  phone: string | null;
  whatsappPhone: string | null;
};

export function BusinessMobileActions({
  businessId,
  businessName,
  phone,
  whatsappPhone
}: Props) {
  const href = whatsappPhone
    ? getBusinessWhatsAppUrl(whatsappPhone, businessName)
    : phone
      ? `tel:${phone}`
      : null;

  if (!href) return null;

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border bg-background/95 p-2 shadow-2xl backdrop-blur lg:hidden">
      <Button asChild size="lg" className="w-full">
        <a
          href={href}
          target={whatsappPhone ? "_blank" : undefined}
          rel={whatsappPhone ? "noopener noreferrer" : undefined}
          onClick={() => trackBusinessEvent(businessId, "phone_click")}
        >
          {whatsappPhone ? <SiWhatsapp /> : <Phone />}
          {whatsappPhone ? "Contactar por WhatsApp" : "Ligar"}
        </a>
      </Button>
    </div>
  );
}
