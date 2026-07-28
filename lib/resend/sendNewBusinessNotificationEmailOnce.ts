import {
  NEW_BUSINESS_NOTIFICATION_EMAIL,
  sendNewBusinessNotificationEmail
} from "@/lib/resend/sendNewBusinessNotificationEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  userId: string;
  businessId: string;
  businessName: string;
  businessSlug: string;
  creatorEmail?: string;
  plan: "free" | "featured" | "premium";
};

const EMAIL_TYPE = "admin_new_business";

export async function sendNewBusinessNotificationEmailOnce({
  userId,
  businessId,
  businessName,
  businessSlug,
  creatorEmail,
  plan
}: Params) {
  const { data: existingDelivery, error: deliveryError } = await supabaseAdmin
    .from("transactional_email_deliveries")
    .select("id, sent_at")
    .eq("business_id", businessId)
    .eq("email_type", EMAIL_TYPE)
    .maybeSingle();

  if (deliveryError) throw deliveryError;

  if (existingDelivery?.sent_at) {
    return { sent: false, alreadySent: true };
  }

  await sendNewBusinessNotificationEmail({
    businessName,
    businessSlug,
    creatorEmail,
    plan
  });

  const delivery = {
    user_id: userId,
    business_id: businessId,
    email_type: EMAIL_TYPE,
    recipient_email: NEW_BUSINESS_NOTIFICATION_EMAIL,
    sent_at: new Date().toISOString()
  };

  const { error: saveError } = existingDelivery
    ? await supabaseAdmin
        .from("transactional_email_deliveries")
        .update(delivery)
        .eq("id", existingDelivery.id)
    : await supabaseAdmin.from("transactional_email_deliveries").insert(delivery);

  if (saveError) throw saveError;

  return { sent: true, alreadySent: false };
}
