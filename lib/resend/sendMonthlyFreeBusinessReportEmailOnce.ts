import "server-only";

import { sendMonthlyFreeBusinessReportEmail } from "@/lib/resend/sendMonthlyFreeBusinessReportEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type SendMonthlyFreeBusinessReportEmailOnceParams = {
  userId: string;
  businessId: string;
  email: string;
  businessName: string;
  businessSlug: string;
  periodKey: string;
  periodLabel: string;
  pageViews: number;
  interactions: number;
};

type SendMonthlyFreeBusinessReportEmailOnceResult = {
  sent: boolean;
  alreadySent: boolean;
};

export async function sendMonthlyFreeBusinessReportEmailOnce({
  userId,
  businessId,
  email,
  businessName,
  businessSlug,
  periodKey,
  periodLabel,
  pageViews,
  interactions
}: SendMonthlyFreeBusinessReportEmailOnceParams): Promise<SendMonthlyFreeBusinessReportEmailOnceResult> {
  const emailType = `monthly_free_business_report:${periodKey}`;

  const { data: existingDelivery, error: deliveryError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("id, sent_at")
    .eq("business_id", businessId)
    .eq("email_type", emailType)
    .maybeSingle();

  if (deliveryError) {
    console.error("Erro ao verificar o relatório mensal:", deliveryError);
    throw new Error("Não foi possível verificar o relatório mensal.");
  }

  if (existingDelivery?.sent_at) {
    return {
      sent: false,
      alreadySent: true
    };
  }

  await sendMonthlyFreeBusinessReportEmail({
    email,
    businessName,
    businessSlug,
    periodLabel,
    pageViews,
    interactions
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
      throw new Error(
        "O relatório foi enviado, mas não foi possível guardar o estado."
      );
    }
  } else {
    const { error: insertError } = await supabaseAdmin
      .from("transactional_email_deliveries")
      .insert({
        user_id: userId,
        business_id: businessId,
        email_type: emailType,
        recipient_email: email,
        sent_at: sentAt
      });

    if (insertError) {
      throw new Error(
        "O relatório foi enviado, mas não foi possível guardar o estado."
      );
    }
  }

  return {
    sent: true,
    alreadySent: false
  };
}
