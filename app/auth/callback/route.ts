import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  /*
   * Apenas permitimos redirects internos.
   * Bloqueia valores como //site-malicioso.com.
   */
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//") ? next : "/area-cliente";

  if (!code) {
    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set("error", "invalid_auth_link");

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Erro ao trocar código por sessão:", error);

    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set("error", "expired_auth_link");

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
