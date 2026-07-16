import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Info,
  MapPin
} from "lucide-react";

import PageContainer from "@/components/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { getEventBySlug } from "@/lib/queries/getEventBySlug";
import ShareButton from "@/components/business/ShareButton";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

const siteUrl = (
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
).replace(/\/$/, "");

function formatEventDate(date: string): string {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Europe/Lisbon",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function getEventDateKey(date: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(date));

  const year = parts.find((part) => part.type === "year")?.value;

  const month = parts.find((part) => part.type === "month")?.value;

  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function getRelevantCategories(categories: string[]): string[] {
  return categories
    .filter(
      (category) =>
        category !== "Evento" &&
        !category.startsWith("AR|") &&
        !category.toLowerCase().includes("listagem")
    )
    .slice(0, 4);
}

function createMetadataDescription(
  description: string | null,
  title: string
): string {
  const fallback = `Consulte os detalhes de ${title}, um evento no concelho do Montijo.`;

  if (!description) {
    return fallback;
  }

  if (description.length <= 155) {
    return description;
  }

  return `${description.slice(0, 152).trimEnd()}...`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Evento não encontrado",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const description = createMetadataDescription(event.description, event.title);

  const canonicalUrl = `${siteUrl}/eventos/${event.slug}`;

  return {
    title: event.title,
    description,

    alternates: {
      canonical: canonicalUrl
    },

    openGraph: {
      title: `${event.title} | Montra Montijo`,
      description,
      url: canonicalUrl,
      type: "website",
      locale: "pt_PT",
      siteName: "Montra Montijo",

      images: event.imageUrl
        ? [
            {
              url: event.imageUrl,
              alt: event.title
            }
          ]
        : undefined
    },

    twitter: {
      card: "summary_large_image",
      title: event.title,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined
    },

    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function EventDetailsPage({ params }: Props) {
  const { slug } = await params;

  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const categories = getRelevantCategories(event.categories);

  const eventUrl = `${siteUrl}/eventos/${event.slug}`;

  /*
   * O RSS apresenta muitas datas à meia-noite sem hora real.
   * Para não indicar incorretamente que o evento começa às 00h00,
   * enviamos apenas YYYY-MM-DD no JSON-LD.
   */
  const eventDate = getEventDateKey(event.eventDate);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description:
      event.description ?? `Evento no concelho do Montijo: ${event.title}.`,
    startDate: eventDate,
    endDate: eventDate,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: eventUrl,

    image: event.imageUrl ? [event.imageUrl] : undefined,

    location: {
      "@type": "Place",
      name: "Concelho do Montijo",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Montijo",
        addressRegion: "Setúbal",
        addressCountry: "PT"
      }
    },

    organizer: {
      "@type": "Organization",
      name: event.sourceName,
      url: "https://www.mun-montijo.pt"
    },

    sameAs: event.sourceUrl
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c")
        }}
      />

      <section className="border-b bg-muted/20">
        <PageContainer className="py-6">
          <Button asChild variant="ghost">
            <Link href="/eventos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar à agenda
            </Link>
          </Button>
        </PageContainer>
      </section>

      <PageContainer className="py-10 sm:py-14">
        <article className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-12">
            <div className="min-w-0">
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Badge
                      key={category}
                      variant="secondary"
                      className="font-normal"
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              )}

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <div className="mt-6 flex flex-col gap-3 text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-6">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 shrink-0 text-primary" />

                  <time dateTime={eventDate}>
                    {formatEventDate(event.eventDate)}
                  </time>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 shrink-0 text-primary" />

                  <span>Concelho do Montijo</span>
                </div>
                <ShareButton
                  title={event.title}
                  text={`Descubra o evento ${event.title} na Montra Montijo.`}
                  url={eventUrl}
                  entityLabel="evento"
                  iconOnly
                />
              </div>
            </div>

            <aside className="lg:row-span-2">
              <div className="rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-24">
                <p className="text-sm font-semibold">Informação oficial</p>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Consulte a página original para confirmar horários,
                  localização, bilhetes e eventuais alterações.
                </p>

                <Button asChild className="mt-5 w-full">
                  <Link
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Consultar fonte oficial
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>

                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Fonte: {event.sourceName}
                </p>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="relative aspect-video overflow-hidden rounded-2xl border bg-muted shadow-sm">
                {event.imageUrl ? (
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                    <CalendarDays className="h-14 w-14 opacity-30" />

                    <p className="mt-3 text-sm">Imagem não disponível</p>
                  </div>
                )}
              </div>

              {event.description && (
                <section className="mt-10">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Sobre o evento
                  </h2>

                  <p className="mt-5 whitespace-pre-line text-base leading-8 text-muted-foreground">
                    {event.description}
                  </p>
                </section>
              )}

              <div className="mt-10 rounded-2xl border bg-muted/20 p-5">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                  <p className="text-sm leading-6 text-muted-foreground">
                    A Montra Montijo agrega esta informação a partir da agenda
                    pública da Câmara Municipal do Montijo. A organização,
                    horários e condições do evento são da responsabilidade da
                    respetiva entidade promotora.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </article>
      </PageContainer>
    </main>
  );
}
