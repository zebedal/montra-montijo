import Link from "next/link";

import { ArrowRight, CalendarDays } from "lucide-react";

import EventCard from "@/components/events/EventCard";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

import { getUpcomingEvents } from "@/lib/queries/getUpcomingEvents";

export default async function UpcomingEventsSection() {
  const { events } = await getUpcomingEvents({
    page: 1,
    pageSize: 3
  });

  if (events.length === 0) {
    return null;
  }

  return (
    <section className="border-y bg-muted/20">
      <PageContainer className="py-16 sm:py-20">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-primary">
              Agenda local
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Próximos eventos no Montijo
            </h2>

            <p className="mt-4 text-base leading-7 text-muted-foreground">
              Descubra atividades culturais, espetáculos, festas e outras
              iniciativas que acontecem no concelho.
            </p>
          </div>

          <Button asChild variant="outline">
            <Link href="/eventos">
              Ver agenda completa
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>

        <div className="mt-8 sm:hidden">
          <Button asChild className="w-full" variant="outline">
            <Link href="/eventos">
              Ver todos os eventos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}
