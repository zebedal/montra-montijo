import { sendWelcomeEmail } from "@/lib/resend/sendWelcomeEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SendWelcomeEmailOnceParams = {
  userId: string;
  email: string;
};

type SendWelcomeEmailOnceResult = {
  sent: boolean;
  alreadySent: boolean;
};

export async function sendWelcomeEmailOnce({
  userId,
  email
}: SendWelcomeEmailOnceParams): Promise<SendWelcomeEmailOnceResult> {
  /*
   * Ler o estado atual do perfil.
   */
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("id, welcome_email_sent_at")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Erro ao verificar o estado do email de boas-vindas:",
      profileError
    );

    throw new Error(
      "Não foi possível verificar o estado do email de boas-vindas."
    );
  }

  if (!profile) {
    console.error("Perfil não encontrado para o utilizador:", userId);

    throw new Error("Perfil do utilizador não encontrado.");
  }

  /*
   * O email já foi enviado anteriormente.
   */
  if (profile.welcome_email_sent_at) {
    return {
      sent: false,
      alreadySent: true
    };
  }

  /*
   * Enviar o email.
   */
  await sendWelcomeEmail({
    email
  });

  /*
   * Marcar como enviado apenas depois de o Resend
   * confirmar que aceitou o envio.
   */
  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      welcome_email_sent_at: new Date().toISOString()
    })
    .eq("id", userId)
    .is("welcome_email_sent_at", null);

  if (updateError) {
    console.error(
      "Email enviado, mas não foi possível atualizar o perfil:",
      updateError
    );

    throw new Error(
      "O email foi enviado, mas não foi possível guardar o estado."
    );
  }

  return {
    sent: true,
    alreadySent: false
  };
}
