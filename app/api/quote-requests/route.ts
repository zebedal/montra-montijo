import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { quoteRequestSchema } from "@/lib/quote-request";
import { sendQuoteRequestNotificationEmail } from "@/lib/resend/sendQuoteRequestNotificationEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

function getRequesterHash(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwardedFor || request.headers.get("x-real-ip") || "unknown";
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "montra-montijo";

  return createHash("sha256").update(`${secret}:${address}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const parsed = quoteRequestSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Verifique os dados do pedido.", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    if (parsed.data.website) {
      return NextResponse.json({ success: true });
    }

    const { data: business, error: businessError } = await supabaseAdmin
      .from("businesses")
      .select("id, name, slug, user_id, is_visible")
      .eq("id", parsed.data.businessId)
      .maybeSingle();

    if (businessError || !business || !business.is_visible) {
      return NextResponse.json({ error: "Negócio não disponível." }, { status: 404 });
    }

    if (!business.user_id || business.user_id === process.env.ADMIN_USER_ID) {
      return NextResponse.json(
        { error: "Este negócio ainda não pode receber pedidos de orçamento." },
        { status: 400 }
      );
    }

    const requesterIpHash = getRequesterHash(request);
    const rateLimitStart = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count, error: rateLimitError } = await supabaseAdmin
      .from("business_quote_requests")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("requester_ip_hash", requesterIpHash)
      .gte("created_at", rateLimitStart);

    if (!rateLimitError && (count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Foram enviados vários pedidos. Tente novamente mais tarde." },
        { status: 429 }
      );
    }

    const { data: quoteRequest, error: insertError } = await supabaseAdmin
      .from("business_quote_requests")
      .insert({
        business_id: business.id,
        owner_user_id: business.user_id,
        requester_name: parsed.data.name,
        requester_phone: parsed.data.phone || null,
        requester_email: parsed.data.email || null,
        description: parsed.data.description,
        locality: parsed.data.locality,
        timing: parsed.data.timing,
        requester_ip_hash: requesterIpHash
      })
      .select("id")
      .single();

    if (insertError || !quoteRequest) {
      console.error("Erro ao guardar pedido de orçamento:", insertError);
      return NextResponse.json(
        { error: "Não foi possível enviar o pedido de orçamento." },
        { status: 500 }
      );
    }

    const { data: ownerData, error: ownerError } =
      await supabaseAdmin.auth.admin.getUserById(business.user_id);
    const ownerEmail = ownerData.user?.email;

    if (!ownerError && ownerEmail) {
      try {
        await sendQuoteRequestNotificationEmail({
          to: ownerEmail,
          businessName: business.name,
          requesterName: parsed.data.name,
          requesterPhone: parsed.data.phone || null,
          requesterEmail: parsed.data.email || null,
          description: parsed.data.description,
          locality: parsed.data.locality,
          timing: parsed.data.timing
        });

        await supabaseAdmin
          .from("business_quote_requests")
          .update({ notification_sent_at: new Date().toISOString() })
          .eq("id", quoteRequest.id);
      } catch (emailError) {
        console.error("Pedido guardado, mas o email falhou:", emailError);
      }
    }

    return NextResponse.json({ success: true, requestId: quoteRequest.id });
  } catch (error) {
    console.error("Erro no pedido de orçamento:", error);
    return NextResponse.json(
      { error: "Não foi possível enviar o pedido de orçamento." },
      { status: 500 }
    );
  }
}
