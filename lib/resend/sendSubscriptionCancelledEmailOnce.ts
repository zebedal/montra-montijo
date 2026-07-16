import { sendSubscriptionCancelledEmail } from "@/lib/resend/sendSubscriptionCancelledEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SendSubscriptionCancelledEmailOnceParams = {
  userId: string;
  businessId: string;
  email: string;
  businessName: string;
  businessSlug: string;
};

type SendSubscriptionCancelledEmailOnceResult = {
  sent: boolean;
  alreadySent: boolean;
};

const EMAIL_TYPE = "subscription_cancelled";

export async function sendSubscriptionCancelledEmailOnce({
  userId,
  businessId,
  email,
  businessName,
  businessSlug
}: SendSubscriptionCancelledEmailOnceParams): Promise<SendSubscriptionCancelledEmailOnceResult> {
  const { data: existingDelivery, error: deliveryError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("id, sent_at")
    .eq("business_id", businessId)
    .eq("email_type", EMAIL_TYPE)
    .maybeSingle();

  if (deliveryError) {
    console.error(
      "Erro ao verificar o estado do email de cancelamento:",
      deliveryError
    );

    throw new Error(
      "Não foi possível verificar o estado do email de cancelamento."
    );
  }

  if (existingDelivery?.sent_at) {
    return {
      sent: false,
      alreadySent: true
    };
  }

  await sendSubscriptionCancelledEmail({
    email,
    businessName,
    businessSlug
  });

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
