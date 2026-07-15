import type { Metadata } from "next";

import { CalendarDays } from "lucide-react";

import EventCard from "@/components/events/EventCard";
import PageContainer from "@/components/PageContainer";

import { getUpcomingEvents } from "@/lib/queries/getUpcomingEvents";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Eventos no Montijo",
  description:
    "Descubra os próximos eventos, espetáculos, atividades culturais, festas e iniciativas no concelho do Montijo.",

  alternates: {
    canonical: "/eventos"
  },

  openGraph: {
    title: "Eventos no Montijo | Montra Montijo",
    description:
      "Consulte os próximos eventos, espetáculos e atividades no concelho do Montijo.",
    url: "/eventos",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo"
  },

  robots: {
    index: true,
    follow: true
  }
};

export default async function EventsPage() {
  const events = await getUpcomingEvents();

  return (
    <main>
      <section className="border-b bg-muted/20">
        <PageContainer className="py-14 sm:py-18">
          <div className="max-w-3xl">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <CalendarDays className="h-7 w-7 text-primary" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-primary">
              Agenda local
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Eventos no Montijo
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Descubra espetáculos, atividades culturais, festas, iniciativas
              desportivas e outros eventos que acontecem no concelho.
            </p>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-12 sm:py-16">
        {events.length > 0 ? (
          <>
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Próximos eventos
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {events.length === 1
                    ? "1 evento disponível"
                    : `${events.length} eventos disponíveis`}
                </p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CalendarDays className="h-6 w-6 text-primary" />
            </div>

            <h2 className="mt-5 text-xl font-semibold">
              Não existem eventos disponíveis
            </h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
              Ainda não existem próximos eventos publicados. Consulte novamente
              em breve.
            </p>
          </div>
        )}

        <div className="mt-12 rounded-xl border bg-muted/20 p-5 text-sm leading-6 text-muted-foreground">
          A informação apresentada é obtida através da agenda pública da Câmara
          Municipal do Montijo. Confirme sempre os horários, condições de acesso
          e eventuais alterações no site da entidade organizadora.
        </div>
      </PageContainer>
    </main>
  );
}
