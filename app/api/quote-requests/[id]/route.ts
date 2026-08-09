import { NextResponse } from "next/server";
import { z } from "zod";

import { QUOTE_REQUEST_STATUSES } from "@/lib/quote-request";
import { createClient } from "@/lib/supabase/server";

const updateSchema = z.object({
  status: z.enum(QUOTE_REQUEST_STATUSES)
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const parsedId = z.string().uuid().safeParse(id);
  const parsedBody = updateSchema.safeParse(await request.json());

  if (!parsedId.success || !parsedBody.success) {
    return NextResponse.json({ error: "Pedido inválido." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("business_quote_requests")
    .update({
      status: parsedBody.data.status,
      updated_at: new Date().toISOString()
    })
    .eq("id", parsedId.data)
    .eq("owner_user_id", user.id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("Erro ao atualizar pedido de orçamento:", error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o pedido." },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true, request: data });
}
