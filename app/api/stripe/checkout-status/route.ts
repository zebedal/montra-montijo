import { NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      {
        error: "Session ID em falta."
      },
      {
        status: 400
      }
    );
  }

  const { data, error } = await supabase
    .from("stripe_checkouts")
    .select("*")
    .eq("session_id", sessionId)
    .single();

  if (error || !data) {
    return NextResponse.json(
      {
        error: "Checkout não encontrado."
      },
      {
        status: 404
      }
    );
  }

  return NextResponse.json({
    status: data.status,
    businessId: data.business_id,
    error: data.error
  });
}
