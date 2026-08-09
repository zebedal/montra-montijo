import { NextResponse } from "next/server";
import { z } from "zod";

import {
  CAMPAIGN_CTA_TYPES,
  CAMPAIGN_TYPES
} from "@/lib/business-campaign";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

const schema = z
  .object({
    campaignId: z.string().uuid().nullable(),
    businessId: z.string().uuid(),
    type: z.enum(CAMPAIGN_TYPES),
    title: z.string().trim().max(90).nullable().refine((value) => value === null || value.length >= 3, "O título deve ter pelo menos 3 caracteres."),
    description: z.string().trim().max(300).nullable().refine((value) => value === null || value.length >= 10, "A descrição deve ter pelo menos 10 caracteres."),
    imagePath: z.string().trim().min(1).max(500),
    startsOn: z.iso.date(),
    endsOn: z.iso.date(),
    ctaType: z.enum(CAMPAIGN_CTA_TYPES).nullable(),
    ctaDestination: z.enum(["url", "whatsapp"]).nullable(),
    ctaUrl: z.string().trim().max(2000).nullable(),
    ctaMessage: z.string().trim().max(500).nullable(),
    isActive: z.boolean()
  })
  .superRefine((data, context) => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());

    if (data.startsOn < today) {
      context.addIssue({
        code: "custom",
        path: ["startsOn"],
        message: "A data de início não pode ser anterior a hoje."
      });
    }

    if (data.endsOn < data.startsOn) {
      context.addIssue({
        code: "custom",
        path: ["endsOn"],
        message: "A data de fim não pode ser anterior à data de início."
      });
    }

    if (data.ctaDestination && !data.ctaType) {
      context.addIssue({ code: "custom", path: ["ctaType"], message: "Escolha o texto do botão." });
    }

    if (data.ctaDestination === "url") {
      const url = z.string().url().safeParse(data.ctaUrl);
      if (!url.success || !data.ctaUrl?.startsWith("https://")) {
        context.addIssue({
          code: "custom",
          path: ["ctaUrl"],
          message: "Indique um link completo começado por https://."
        });
      }
    }
  });

const deleteSchema = z.object({
  campaignId: z.string().uuid(),
  businessId: z.string().uuid()
});

export async function PUT(request: Request) {
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Campanha inválida." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }
  const isAdmin = user.id === process.env.ADMIN_USER_ID;

  const { data: business, error: businessError } = await supabaseAdmin
    .from("businesses")
    .select("id, plan, whatsapp_phone")
    .eq("id", parsed.data.businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (businessError || !business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  if (business.plan !== "premium") {
    return NextResponse.json(
      { error: "As campanhas estão disponíveis no Plano Premium." },
      { status: 403 }
    );
  }

  if (
    parsed.data.ctaDestination === "whatsapp" &&
    !business.whatsapp_phone
  ) {
    return NextResponse.json(
      { error: "Este negócio não tem um número de WhatsApp configurado." },
      { status: 400 }
    );
  }

  const campaignValues = {
      business_id: business.id,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description,
      image_path: parsed.data.imagePath,
      starts_on: parsed.data.startsOn,
      ends_on: parsed.data.endsOn,
      cta_type: parsed.data.ctaType,
      cta_destination: parsed.data.ctaDestination,
      cta_url:
        parsed.data.ctaDestination === "url" ? parsed.data.ctaUrl : null,
      cta_message:
        parsed.data.ctaDestination === "whatsapp"
          ? parsed.data.ctaMessage
          : null,
      is_active: parsed.data.isActive,
      updated_at: new Date().toISOString()
  };

  if (!parsed.data.campaignId && !isAdmin) {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Lisbon",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(new Date());
    const { data: existingCampaign } = await supabaseAdmin
      .from("business_campaigns")
      .select("id")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .gte("ends_on", today)
      .limit(1)
      .maybeSingle();

    if (existingCampaign) {
      return NextResponse.json(
        { error: "Este negócio já tem uma campanha ativa ou agendada." },
        { status: 409 }
      );
    }
  }

  const campaignQuery = parsed.data.campaignId
    ? supabaseAdmin
        .from("business_campaigns")
        .update(campaignValues)
        .eq("id", parsed.data.campaignId)
        .eq("business_id", business.id)
    : supabaseAdmin.from("business_campaigns").insert(campaignValues);
  const { data: savedCampaign, error } = await campaignQuery.select("id").single();

  if (error) {
    console.error("Erro ao guardar campanha:", error);
    return NextResponse.json(
      { error: "Não foi possível guardar a campanha." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, campaignId: savedCampaign.id });
}

export async function DELETE(request: Request) {
  const parsed = deleteSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: business } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("id", parsed.data.businessId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  const { data: campaign } = await supabaseAdmin
    .from("business_campaigns")
    .select("image_path")
    .eq("id", parsed.data.campaignId)
    .eq("business_id", business.id)
    .maybeSingle();

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  const { error } = await supabaseAdmin
    .from("business_campaigns")
    .delete()
    .eq("id", parsed.data.campaignId)
    .eq("business_id", business.id);

  if (error) {
    console.error("Erro ao apagar campanha:", error);
    return NextResponse.json(
      { error: "Não foi possível apagar a campanha." },
      { status: 500 }
    );
  }

  if (campaign?.image_path) {
    const { error: storageError } = await supabaseAdmin.storage
      .from("business-media")
      .remove([campaign.image_path]);
    if (storageError) console.error("Erro ao apagar imagem da campanha:", storageError);
  }

  return NextResponse.json({ success: true });
}
