"use client";

import Link from "next/link";
import { Globe, Mail, MapPin, MapPinned, Phone } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp } from "react-icons/si";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  trackBusinessEvent,
  type BusinessEventType
} from "@/lib/analytics/trackBusinessEvent";

type BusinessContactProps = {
  business: {
    id: string;
    name: string;
    street: string | null;
    number: string | null;
    postal_code: string | null;
    city: string | null;
    phone: string | null;
    whatsapp_phone: string | null;
    email: string | null;
    website: string | null;
    instagram: string | null;
    facebook: string | null;
    latitude: number | null;
    longitude: number | null;
  };
};

type ContactRow = {
  label: string;
  value: string;
  icon: React.ElementType;
  iconClass: string;
  href?: string;
  external?: boolean;
  eventType?: BusinessEventType;
};

function getDisplayUrl(value: string) {
  try {
    const url = new URL(value);

    return url.hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function getWhatsAppUrl(phone: string, businessName: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.length === 9) {
    digits = `351${digits}`;
  }

  const message = `Olá! Encontrei ${businessName} na Montra Montijo e gostaria de pedir mais informações.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function BusinessContact({ business }: BusinessContactProps) {
  const address = [
    [business.street, business.number].filter(Boolean).join(" "),
    business.postal_code,
    business.city
  ]
    .filter(Boolean)
    .join(", ");

  const mapsUrl =
    business.latitude !== null && business.longitude !== null
      ? `https://www.google.com/maps?q=${business.latitude},${business.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          address
        )}`;

  const rows: ContactRow[] = [
    ...(address
      ? [
          {
            label: "Morada",
            value: address,
            icon: MapPin,
            iconClass: "bg-orange-100 text-orange-700"
          }
        ]
      : []),

    ...(business.phone
      ? [
          {
            label: "Telefone",
            value: business.phone,
            icon: Phone,
            href: `tel:${business.phone}`,
            eventType: "phone_click" as const,
            iconClass: "bg-green-100 text-green-700"
          }
        ]
      : []),

    ...(business.whatsapp_phone
      ? [
          {
            label: "WhatsApp",
            value: business.whatsapp_phone,
            icon: SiWhatsapp,
            href: getWhatsAppUrl(business.whatsapp_phone, business.name),
            external: true,
            eventType: "phone_click" as const,
            iconClass: "bg-emerald-100 text-emerald-700"
          }
        ]
      : []),

    ...(business.email
      ? [
          {
            label: "Email",
            value: business.email,
            icon: Mail,
            href: `mailto:${business.email}`,
            eventType: "email_click" as const,
            iconClass: "bg-blue-100 text-blue-700"
          }
        ]
      : []),

    ...(business.website
      ? [
          {
            label: "Website",
            value: getDisplayUrl(business.website),
            icon: Globe,
            href: business.website,
            external: true,
            eventType: "website_click" as const,
            iconClass: "bg-slate-100 text-slate-700"
          }
        ]
      : []),

    ...(business.instagram
      ? [
          {
            label: "Instagram",
            value: getDisplayUrl(business.instagram),
            icon: SiInstagram,
            href: business.instagram,
            external: true,
            eventType: "instagram_click" as const,
            iconClass: "bg-pink-100 text-pink-600"
          }
        ]
      : []),

    ...(business.facebook
      ? [
          {
            label: "Facebook",
            value: getDisplayUrl(business.facebook),
            icon: SiFacebook,
            href: business.facebook,
            external: true,
            eventType: "facebook_click" as const,
            iconClass: "bg-blue-100 text-blue-600"
          }
        ]
      : [])
  ];

  function handleTrack(eventType?: BusinessEventType) {
    if (!eventType) return;

    trackBusinessEvent(business.id, eventType);
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <Card className="mt-10">
      <CardHeader>
        <CardTitle>Contactos</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {rows.map(
          ({
            label,
            value,
            icon: Icon,
            href,
            external,
            eventType,
            iconClass
          }) => {
            const content = (
              <>
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105",
                    iconClass
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {label}
                  </p>

                  <p className="break-all text-sm font-medium leading-6">
                    {value}
                  </p>
                </div>
              </>
            );

            if (!href) {
              return (
                <div
                  key={label}
                  className="flex items-start gap-4 rounded-xl border p-3"
                >
                  {content}
                </div>
              );
            }

            if (external) {
              return (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleTrack(eventType)}
                  className="group flex items-start gap-4 rounded-xl border p-3 transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {content}
                </Link>
              );
            }

            return (
              <a
                key={label}
                href={href}
                onClick={() => handleTrack(eventType)}
                className="group flex items-start gap-4 rounded-xl border p-3 transition-all duration-200 hover:border-primary/40 hover:bg-muted/40 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {content}
              </a>
            );
          }
        )}

        <Button asChild className="mt-3 w-full">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackBusinessEvent(business.id, "directions_click")}
          >
            <MapPinned className="mr-2 h-4 w-4" />
            Como chegar
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
