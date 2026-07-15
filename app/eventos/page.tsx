import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";

import EventCard from "@/components/events/EventCard";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";

import { getUpcomingEvents } from "@/lib/queries/getUpcomingEvents";

export const metadata: Metadata = {
  title: "Agenda do Montijo",
  description:
    "Descubra os próximos eventos, espetáculos, atividades culturais, festas e iniciativas no concelho do Montijo.",

  alternates: {
    canonical: "/eventos"
  },

  openGraph: {
    title: "Agenda do Montijo | Montra Montijo",
    description:
      "Consulte os próximos eventos, espetáculos e atividades no concelho do Montijo.",
    url: "/eventos",
    type: "website",
    locale: "pt_PT",
    siteName: "Montra Montijo"
  }
};

type Props = {
  searchParams: Promise<{
    page?: string;
  }>;
};

const PAGE_SIZE = 9;

export default async function EventsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;

  const parsedPage = Number(pageParam ?? "1");

  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const { events, total, totalPages } = await getUpcomingEvents({
    page,
    pageSize: PAGE_SIZE
  });

  /*
   * Evita páginas vazias como /eventos?page=999.
   */
  if (totalPages > 0 && page > totalPages) {
    redirect(`/eventos?page=${totalPages}`);
  }

  const previousHref = page === 2 ? "/eventos" : `/eventos?page=${page - 1}`;

  const nextHref = `/eventos?page=${page + 1}`;

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
              Agenda do Montijo
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              Descubra espetáculos, atividades culturais, festas, iniciativas
              desportivas e outros eventos no concelho.
            </p>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-12 sm:py-16">
        {events.length > 0 ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight">
                Próximos eventos
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {total === 1
                  ? "1 evento disponível"
                  : `${total} eventos disponíveis`}
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav
                aria-label="Paginação dos eventos"
                className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row"
              >
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>

                <div className="flex w-full gap-3 sm:w-auto">
                  {page > 1 ? (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <Link href={previousHref}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Anterior
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="flex-1 sm:flex-none"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                  )}

                  {page < totalPages ? (
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 sm:flex-none"
                    >
                      <Link href={nextHref}>
                        Seguinte
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      disabled
                      className="flex-1 sm:flex-none"
                    >
                      Seguinte
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </nav>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed bg-muted/20 px-6 py-16 text-center">
            <CalendarDays className="mx-auto h-8 w-8 text-primary" />

            <h2 className="mt-5 text-xl font-semibold">
              Não existem eventos disponíveis
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              Consulte novamente em breve.
            </p>
          </div>
        )}
      </PageContainer>
    </main>
  );
}
