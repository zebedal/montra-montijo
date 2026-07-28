import { NextResponse } from "next/server";
import { z } from "zod";

import {
  PRIMARY_CTA_TYPES,
  type PrimaryCtaDestination
} from "@/lib/business-primary-cta";
import { createClient } from "@/lib/supabase/server";

const schema = z
  .object({
    enabled: z.boolean(),
    type: z.enum(PRIMARY_CTA_TYPES).nullable(),
    destination: z.enum(["url", "whatsapp"]).nullable(),
    url: z.string().trim().max(2000).nullable(),
    message: z.string().trim().max(500).nullable()
  })
  .superRefine((data, context) => {
    if (!data.enabled) return;

    if (!data.type) {
      context.addIssue({
        code: "custom",
        path: ["type"],
        message: "Escolha a ação principal."
      });
    }

    if (!data.destination) {
      context.addIssue({
        code: "custom",
        path: ["destination"],
        message: "Escolha o destino do botão."
      });
    }

    if (data.destination === "url") {
      const result = z.url({ protocol: /^https?$/ }).safeParse(data.url);

      if (!result.success) {
        context.addIssue({
          code: "custom",
          path: ["url"],
          message: "Indique um endereço completo começado por https://."
        });
      }
    }
  });

type Props = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, { params }: Props) {
  const { id } = await params;
  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Configuração inválida." },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, plan, whatsapp_phone")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (businessError) {
    return NextResponse.json(
      { error: "Não foi possível validar o negócio." },
      { status: 500 }
    );
  }

  if (!business) {
    return NextResponse.json({ error: "Negócio não encontrado." }, { status: 404 });
  }

  if (business.plan !== "premium") {
    return NextResponse.json(
      { error: "A ação principal está disponível no Plano Destaque." },
      { status: 403 }
    );
  }

  const { enabled, type, destination, url, message } = parsed.data;

  if (enabled && destination === "whatsapp" && !business.whatsapp_phone) {
    return NextResponse.json(
      { error: "Adicione primeiro um número de WhatsApp aos contactos." },
      { status: 400 }
    );
  }

  const payload: {
    primary_cta_enabled: boolean;
    primary_cta_type: string | null;
    primary_cta_destination: PrimaryCtaDestination | null;
    primary_cta_url: string | null;
    primary_cta_message: string | null;
  } = {
    primary_cta_enabled: enabled,
    primary_cta_type: type,
    primary_cta_destination: destination,
    primary_cta_url: destination === "url" ? url : null,
    primary_cta_message: destination === "whatsapp" ? message : null
  };

  const { error: updateError } = await supabase
    .from("businesses")
    .update(payload)
    .eq("id", id)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Erro ao guardar ação principal:", updateError);
    return NextResponse.json(
      { error: "Não foi possível guardar a ação principal." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
