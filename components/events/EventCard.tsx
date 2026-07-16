import Image from "next/image";
import Link from "next/link";

import { ArrowRight, CalendarDays, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { PublicEvent } from "@/lib/queries/getUpcomingEvents";

type Props = {
  event: PublicEvent;
};

function formatEventDate(date: string) {
  return new Intl.DateTimeFormat("pt-PT", {
    timeZone: "Europe/Lisbon",
    weekday: "short",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));
}

function getRelevantCategories(categories: string[]) {
  return categories
    .filter(
      (category) =>
        category !== "Evento" &&
        !category.startsWith("AR|") &&
        !category.toLowerCase().includes("listagem")
    )
    .slice(0, 2);
}

export default function EventCard({ event }: Props) {
  const categories = getRelevantCategories(event.categories);

  return (
    <article className="group flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-muted">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}

        <div className="absolute left-3 top-3 rounded-xl bg-background/95 px-3 py-2 text-center shadow-sm backdrop-blur-sm">
          <p className="text-xl font-bold leading-none">
            {new Intl.DateTimeFormat("pt-PT", {
              timeZone: "Europe/Lisbon",
              day: "2-digit"
            }).format(new Date(event.eventDate))}
          </p>

          <p className="mt-1 text-xs font-semibold uppercase text-muted-foreground">
            {new Intl.DateTimeFormat("pt-PT", {
              timeZone: "Europe/Lisbon",
              month: "short"
            }).format(new Date(event.eventDate))}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge key={category} variant="secondary" className="font-normal">
                {category}
              </Badge>
            ))}
          </div>
        )}

        <h2 className="mt-4 line-clamp-2 text-xl font-semibold tracking-tight">
          {event.title}
        </h2>

        <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />

          <span>{formatEventDate(event.eventDate)}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>Concelho do Montijo</span>
        </div>

        {event.description && (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {event.description}
          </p>
        )}

        <div className="mt-auto pt-6">
          <Button asChild variant="outline" className="w-full">
            <Link href={`/eventos/${event.slug}`}>
              Ver detalhes
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Fonte: {event.sourceName}
          </p>
        </div>
      </div>
    </article>
  );
}
