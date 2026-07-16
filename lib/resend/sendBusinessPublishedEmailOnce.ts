import { sendBusinessPublishedEmail } from "@/lib/resend/sendBusinessPublishedEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SendBusinessPublishedEmailOnceParams = {
  userId: string;
  businessId: string;
  email: string;
  businessName: string;
  businessSlug: string;
};

type SendBusinessPublishedEmailOnceResult = {
  sent: boolean;
  alreadySent: boolean;
};

const EMAIL_TYPE = "business_published";

export async function sendBusinessPublishedEmailOnce({
  userId,
  businessId,
  email,
  businessName,
  businessSlug
}: SendBusinessPublishedEmailOnceParams): Promise<SendBusinessPublishedEmailOnceResult> {
  /*
   * Verificar se este email já foi enviado para o negócio.
   */
  const { data: existingDelivery, error: deliveryError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("id, sent_at")
    .eq("business_id", businessId)
    .eq("email_type", EMAIL_TYPE)
    .maybeSingle();

  if (deliveryError) {
    console.error(
      "Erro ao verificar o estado do email de publicação:",
      deliveryError
    );

    throw new Error(
      "Não foi possível verificar o estado do email de publicação."
    );
  }

  if (existingDelivery?.sent_at) {
    return {
      sent: false,
      alreadySent: true
    };
  }

  /*
   * Enviar o email.
   */
  await sendBusinessPublishedEmail({
    email,
    businessName,
    businessSlug
  });

  /*
   * Guardar o envio apenas depois de o Resend
   * confirmar que aceitou o email.
   */
  const sentAt = new Date().toISOString();

  if (existingDelivery) {
    const { error: updateError } = await supabaseAdmin
      .from("transactional_email_deliveries")
      .update({
        recipient_email: email,
        sent_at: sentAt
      })
      .eq("id", existingDelivery.id);

    if (updateError) {
      console.error(
        "Email enviado, mas não foi possível atualizar o registo:",
        updateError
      );

      throw new Error(
        "O email foi enviado, mas não foi possível guardar o estado."
      );
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from("transactional_email_deliveries")
      .insert({
        user_id: userId,
        business_id: businessId,
        email_type: EMAIL_TYPE,
        recipient_email: email,
        sent_at: sentAt
      });

    if (insertError) {
      console.error(
        "Email enviado, mas não foi possível guardar o registo:",
        insertError
      );

      throw new Error(
        "O email foi enviado, mas não foi possível guardar o estado."
      );
    }
  }

  return {
    sent: true,
    alreadySent: false
  };
}
