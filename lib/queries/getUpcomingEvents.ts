import { createClient } from "@/lib/supabase/server";

export type PublicEvent = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  eventDate: string;
  categories: string[];
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string;
};

type EventRow = {
  id: string;
  title: string;
  slug: string;
  description_text: string | null;
  event_date: string;
  categories: string[] | null;
  image_url: string | null;
  source_url: string;
  source_name: string;
};

type GetUpcomingEventsParams = {
  page?: number;
  pageSize?: number;
};

export type UpcomingEventsResult = {
  events: PublicEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function getUpcomingEvents({
  page = 1,
  pageSize = 9
}: GetUpcomingEventsParams = {}): Promise<UpcomingEventsResult> {
  const supabase = await createClient();

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, Math.min(pageSize, 50));

  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  /*
   * Recuamos 24 horas para não excluir eventos do próprio dia
   * que estejam guardados à meia-noite.
   */
  const queryStart = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, count, error } = await supabase
    .from("events")
    .select(
      `
        id,
        title,
        slug,
        description_text,
        event_date,
        categories,
        image_url,
        source_url,
        source_name
      `,
      {
        count: "exact"
      }
    )
    .gte("event_date", queryStart)
    .order("event_date", {
      ascending: true
    })
    .range(from, to);

  if (error) {
    console.error("Erro ao obter eventos:", error);

    return {
      events: [],
      total: 0,
      page: safePage,
      pageSize: safePageSize,
      totalPages: 0
    };
  }

  const rows = (data ?? []) as EventRow[];
  const total = count ?? 0;

  return {
    events: rows.map((event) => ({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description_text,
      eventDate: event.event_date,
      categories: event.categories ?? [],
      imageUrl: event.image_url,
      sourceUrl: event.source_url,
      sourceName: event.source_name
    })),

    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize)
  };
}
