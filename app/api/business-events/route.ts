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
  "directions_click",
  "primary_cta_click",
  "campaign_view",
  "campaign_click",
  "campaign_cta_click"
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
      .select(
        "id, user_id, plan, primary_cta_enabled, primary_cta_type"
      )
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

    if (
      eventType === "primary_cta_click" &&
      (business.plan !== "premium" || !business.primary_cta_enabled)
    ) {
      return NextResponse.json(
        { error: "A ação principal não está disponível." },
        { status: 400 }
      );
    }

    let campaignMetadata: Record<string, string> = {};

    if (eventType.startsWith("campaign_")) {
      const today = new Date().toISOString().slice(0, 10);
      const { data: campaign } = await supabaseAdmin
        .from("business_campaigns")
        .select("id, type, cta_type")
        .eq("business_id", businessId)
        .eq("is_active", true)
        .lte("starts_on", today)
        .gte("ends_on", today)
        .maybeSingle();

      if (!campaign || business.plan !== "premium") {
        return NextResponse.json(
          { error: "A campanha não está disponível." },
          { status: 400 }
        );
      }

      campaignMetadata = {
        campaignId: campaign.id,
        campaignType: campaign.type,
        campaignCtaType: campaign.cta_type
      };
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
        event_type: eventType,
        metadata:
          eventType === "primary_cta_click"
            ? { ctaType: business.primary_cta_type }
            : campaignMetadata
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
