import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const allowedEvents = [
  "page_view",
  "phone_click",
  "email_click",
  "website_click",
  "instagram_click",
  "facebook_click",
  "directions_click"
] as const;

type BusinessEventType = (typeof allowedEvents)[number];

type RequestBody = {
  businessId: string;
  eventType: BusinessEventType;
};

export async function POST(request: Request) {
  try {
    const { businessId, eventType } = (await request.json()) as RequestBody;

    if (!businessId || !allowedEvents.includes(eventType)) {
      return NextResponse.json(
        {
          error: "Evento inválido."
        },
        {
          status: 400
        }
      );
    }

    /**
     * Obter o negócio e o respetivo proprietário.
     */
    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, user_id")
      .eq("id", businessId)
      .maybeSingle();

    if (businessError) {
      console.error("Erro ao obter o negócio para tracking:", businessError);

      return NextResponse.json(
        {
          error: "Não foi possível validar o negócio."
        },
        {
          status: 500
        }
      );
    }

    if (!business) {
      return NextResponse.json(
        {
          error: "Negócio não encontrado."
        },
        {
          status: 404
        }
      );
    }

    /**
     * Não contar page views do próprio proprietário.
     *
     * Um visitante anónimo não terá user autenticado,
     * o que é perfeitamente válido.
     */
    if (eventType === "page_view") {
      const supabase = await createClient();

      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Erro ao verificar utilizador no tracking:", userError);
      }

      if (user && user.id === business.user_id) {
        return NextResponse.json({
          success: true,
          ignored: true,
          reason: "business_owner"
        });
      }
    }

    /**
     * Registar o evento.
     */
    const { error: insertError } = await supabaseAdmin
      .from("business_events")
      .insert({
        business_id: businessId,
        event_type: eventType
      });

    if (insertError) {
      console.error("Erro ao registar evento:", insertError);

      return NextResponse.json(
        {
          error: "Não foi possível registar o evento."
        },
        {
          status: 500
        }
      );
    }

    return NextResponse.json({
      success: true,
      ignored: false
    });
  } catch (error) {
    console.error("Erro na API de tracking:", error);

    return NextResponse.json(
      {
        error: "Não foi possível registar o evento."
      },
      {
        status: 500
      }
    );
  }
}
