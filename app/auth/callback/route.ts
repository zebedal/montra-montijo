import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/";

  /*
   * Evitar redirects externos.
   */
  const safeNext = next.startsWith("/") ? next : "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/recuperar-password?error=invalid_link", requestUrl.origin)
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error(
      "Erro ao trocar o código de recuperação por uma sessão:",
      error
    );

    return NextResponse.redirect(
      new URL("/recuperar-password?error=expired_link", requestUrl.origin)
    );
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
