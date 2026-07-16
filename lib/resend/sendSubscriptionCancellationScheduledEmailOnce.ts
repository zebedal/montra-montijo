import { sendSubscriptionCancellationScheduledEmail } from "@/lib/resend/sendSubscriptionCancellationScheduledEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SendSubscriptionCancellationScheduledEmailOnceParams = {
  userId: string;
  businessId: string;
  email: string;
  businessName: string;
  businessSlug: string;
  currentPeriodEnd: string;
};

type SendSubscriptionCancellationScheduledEmailOnceResult = {
  sent: boolean;
  alreadySent: boolean;
};

const EMAIL_TYPE = "subscription_cancellation_scheduled";

export async function sendSubscriptionCancellationScheduledEmailOnce({
  userId,
  businessId,
  email,
  businessName,
  businessSlug,
  currentPeriodEnd
}: SendSubscriptionCancellationScheduledEmailOnceParams): Promise<SendSubscriptionCancellationScheduledEmailOnceResult> {
  const { data: existingDelivery, error: deliveryError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("id, sent_at")
    .eq("business_id", businessId)
    .eq("email_type", EMAIL_TYPE)
    .maybeSingle();

  if (deliveryError) {
    console.error(
      "Erro ao verificar o estado do email de cancelamento agendado:",
      deliveryError
    );

    throw new Error(
      "Não foi possível verificar o estado do email de cancelamento agendado."
    );
  }

  if (existingDelivery?.sent_at) {
    return {
      sent: false,
      alreadySent: true
    };
  }

  await sendSubscriptionCancellationScheduledEmail({
    email,
    businessName,
    businessSlug,
    currentPeriodEnd
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
