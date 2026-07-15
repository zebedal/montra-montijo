import { NextRequest, NextResponse } from "next/server";

import { fetchMontijoEvents } from "@/lib/rss/events";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createSlug } from "@/lib/utils";

const MAX_DESCRIPTION_LENGTH = 1000;

function createEventSlug({
  title,
  sourceGuid
}: {
  title: string;
  sourceGuid: string;
}) {
  const baseSlug = createSlug(title);

  /*
   * O identificador final evita colisões entre eventos
   * com o mesmo título.
   */
  const sourceIdentifier = crypto.randomUUID().slice(0, 8);

  /*
   * Quando possível, usamos o último segmento do URL,
   * que já costuma ser único e amigável.
   */
  try {
    const sourceUrl = new URL(sourceGuid);
    const sourceSlug = sourceUrl.pathname.split("/").filter(Boolean).at(-1);

    return sourceSlug
      ? createSlug(sourceSlug)
      : `${baseSlug}-${sourceIdentifier}`;
  } catch {
    return `${baseSlug}-${sourceIdentifier}`;
  }
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");

  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        error: "Não autorizado."
      },
      {
        status: 401
      }
    );
  }

  try {
    const events = await fetchMontijoEvents();

    if (events.length === 0) {
      return NextResponse.json({
        success: true,
        received: 0,
        synchronized: 0,
        message: "O RSS não devolveu eventos válidos."
      });
    }

    /*
     * Primeiro procuramos eventos já existentes para
     * preservar os respetivos slugs.
     */
    const sourceGuids = events.map((event) => event.sourceGuid);

    const { data: existingEvents, error: existingError } = await supabaseAdmin
      .from("events")
      .select("source_guid, slug")
      .in("source_guid", sourceGuids);

    if (existingError) {
      console.error("Erro ao obter eventos existentes:", existingError);

      return NextResponse.json(
        {
          error: "Não foi possível verificar os eventos existentes."
        },
        {
          status: 500
        }
      );
    }

    const existingSlugs = new Map(
      (existingEvents ?? []).map((event) => [event.source_guid, event.slug])
    );

    const now = new Date().toISOString();

    const rows = events.map((event) => ({
      title: event.title,

      slug:
        existingSlugs.get(event.sourceGuid) ??
        createEventSlug({
          title: event.title,
          sourceGuid: event.sourceGuid
        }),

      description_html: event.descriptionHtml,

      description_text:
        event.descriptionText.length > MAX_DESCRIPTION_LENGTH
          ? `${event.descriptionText
              .slice(0, MAX_DESCRIPTION_LENGTH)
              .trimEnd()}...`
          : event.descriptionText,

      event_date: event.eventDate,
      categories: event.categories,
      image_url: event.imageUrl,

      source_url: event.sourceUrl,
      source_guid: event.sourceGuid,
      source_name: event.sourceName,

      updated_at: now
    }));

    const { data: synchronizedEvents, error } = await supabaseAdmin
      .from("events")
      .upsert(rows, {
        onConflict: "source_guid"
      })
      .select("id, title, slug, event_date");

    if (error) {
      console.error("Erro ao sincronizar eventos:", error);

      return NextResponse.json(
        {
          error: "Não foi possível sincronizar os eventos."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      received: events.length,
      synchronized: synchronizedEvents?.length ?? 0
    });
  } catch (error) {
    console.error("Erro inesperado ao sincronizar eventos:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Ocorreu um erro inesperado."
      },
      {
        status: 500
      }
    );
  }
}
