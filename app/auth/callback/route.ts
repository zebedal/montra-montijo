import { NextResponse } from "next/server";

import { sendWelcomeEmailOnce } from "@/lib/resend/sendWelcomeEmailOnce";
import { createClient } from "@/lib/supabase/server";
import { Routes } from "@/types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  const flow = requestUrl.searchParams.get("flow");

  /*
   * Permitir apenas caminhos internos.
   * Também bloqueia valores como //site-malicioso.com.
   */
  const safeNext =
    next?.startsWith("/") && !next.startsWith("//")
      ? next
      : Routes.AREA_CLIENTE;

  if (!code) {
    const loginUrl = new URL(Routes.LOGIN, requestUrl.origin);

    loginUrl.searchParams.set("error", "invalid_auth_link");

    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Erro ao trocar código por sessão:", error);

    const loginUrl = new URL("/login", requestUrl.origin);

    loginUrl.searchParams.set("error", "expired_auth_link");

    return NextResponse.redirect(loginUrl);
  }

  /*
   * Só enviar o email de boas-vindas quando o callback
   * corresponde à confirmação de uma conta nova.
   *
   * Não enviamos durante recuperação de palavra-passe.
   */
  if (flow === "signup" && data.user?.id && data.user.email) {
    try {
      const result = await sendWelcomeEmailOnce({
        userId: data.user.id,
        email: data.user.email
      });

      console.log(
        result.alreadySent
          ? "Email de boas-vindas já tinha sido enviado."
          : "Email de boas-vindas enviado com sucesso.",
        {
          userId: data.user.id
        }
      );
    } catch (welcomeEmailError) {
      /*
       * Uma falha no Resend nunca deve impedir o utilizador
       * de confirmar a conta e entrar na aplicação.
       */
      console.error(
        "Conta confirmada, mas falhou o email de boas-vindas:",
        welcomeEmailError
      );
    }
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}
