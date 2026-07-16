import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { sendWelcomeEmailOnce } from "@/lib/resend/sendWelcomeEmailOnce";
import { createClient } from "@/lib/supabase/server";
import { Routes } from "@/types";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);

  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
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

  const supabase = await createClient();

  let userId: string | undefined;
  let userEmail: string | undefined;

  /*
   * Confirmação de signup através de token_hash.
   *
   * Este fluxo não depende do code_verifier PKCE guardado
   * no browser onde a conta foi criada.
   */
  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType
    });

    if (error) {
      console.error("Erro ao verificar token de autenticação:", {
        message: error.message,
        code: error.code,
        status: error.status,
        type,
        flow
      });

      return redirectToAuthError(requestUrl, "invalid_or_expired_auth_link");
    }

    userId = data.user?.id;
    userEmail = data.user?.email;
  } else if (code) {
    /*
     * Fluxo PKCE atual, usado sobretudo na recuperação
     * de palavra-passe e mantido por compatibilidade.
     */
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Erro ao trocar código por sessão:", {
        message: error.message,
        code: error.code,
        status: error.status,
        flow
      });

      return redirectToAuthError(requestUrl, "invalid_or_expired_auth_link");
    }

    userId = data.user?.id;
    userEmail = data.user?.email;
  } else {
    return redirectToAuthError(requestUrl, "invalid_auth_link");
  }

  /*
   * Só enviar o email de boas-vindas após a confirmação
   * de uma conta nova.
   *
   * Uma falha no Resend nunca bloqueia a autenticação.
   */
  if (flow === "signup" && userId && userEmail) {
    try {
      const result = await sendWelcomeEmailOnce({
        userId,
        email: userEmail
      });

      console.log(
        result.alreadySent
          ? "Email de boas-vindas já tinha sido enviado."
          : "Email de boas-vindas enviado com sucesso.",
        { userId }
      );
    } catch (welcomeEmailError) {
      console.error(
        "Conta confirmada, mas falhou o email de boas-vindas:",
        welcomeEmailError
      );
    }
  }

  return NextResponse.redirect(new URL(safeNext, requestUrl.origin));
}

function redirectToAuthError(requestUrl: URL, errorCode: string) {
  const loginUrl = new URL(Routes.LOGIN, requestUrl.origin);

  loginUrl.searchParams.set("error", errorCode);

  return NextResponse.redirect(loginUrl);
}
