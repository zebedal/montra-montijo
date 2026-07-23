import "server-only";

import {
  createMonthlyReportUnsubscribeToken,
  getMonthlyReportSiteUrl
} from "@/lib/resend/monthlyReportPreferences";
import { sendIncompleteBusinessProfileEmail } from "@/lib/resend/sendIncompleteBusinessProfileEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

const EMAIL_TYPE = "incomplete_business_profile_reminder";

type Params = {
  userId: string;
  businessId: string;
  email: string;
  businessName: string;
  completion: number;
  missingItems: string[];
};

export async function sendIncompleteBusinessProfileEmailOnce({
  userId,
  businessId,
  email,
  businessName,
  completion,
  missingItems
}: Params) {
  const { data: existing, error: existingError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("id, sent_at")
    .eq("business_id", businessId)
    .eq("email_type", EMAIL_TYPE)
    .maybeSingle();

  if (existingError) {
    throw new Error("Não foi possível verificar o lembrete anterior.");
  }

  if (existing?.sent_at) {
    return {
      sent: false,
      alreadySent: true
    };
  }

  const unsubscribeUrl = `${getMonthlyReportSiteUrl()}/cancelar-relatorios?token=${encodeURIComponent(
    createMonthlyReportUnsubscribeToken(userId)
  )}`;

  await sendIncompleteBusinessProfileEmail({
    email,
    businessId,
    businessName,
    completion,
    missingItems,
    unsubscribeUrl
  });

  const delivery = {
    user_id: userId,
    business_id: businessId,
    email_type: EMAIL_TYPE,
    recipient_email: email,
    sent_at: new Date().toISOString()
  };

  const { error: saveError } = existing
    ? await supabaseAdmin
        .from("transactional_email_deliveries")
        .update(delivery)
        .eq("id", existing.id)
    : await supabaseAdmin.from("transactional_email_deliveries").insert(delivery);

  if (saveError) {
    throw new Error("O lembrete foi enviado, mas o estado não ficou guardado.");
  }

  return {
    sent: true,
    alreadySent: false
  };
}
