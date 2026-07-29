import "server-only";

import { sendBusinessListingInvitationEmail } from "@/lib/resend/sendBusinessListingInvitationEmail";
import { supabaseAdmin } from "@/lib/supabase/admin";

type Params = {
  userId: string;
  businessId: string;
  email: string;
  businessName: string;
  businessSlug: string;
};

const EMAIL_TYPE = "business_listing_invitation";

export async function sendBusinessListingInvitationEmailOnce({
  userId,
  businessId,
  email,
  businessName,
  businessSlug
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

  await sendBusinessListingInvitationEmail({
    email,
    businessId,
    businessName,
    businessSlug
  });

  const delivery = {
    user_id: userId,
    business_id: businessId,
    email_type: EMAIL_TYPE,
    recipient_email: email.trim().toLowerCase(),
    sent_at: new Date().toISOString()
  };

  const { error: saveError } = existingDelivery
    ? await supabaseAdmin
        .from("transactional_email_deliveries")
        .update(delivery)
        .eq("id", existingDelivery.id)
    : await supabaseAdmin
        .from("transactional_email_deliveries")
        .insert(delivery);

  if (saveError) throw saveError;

  return { sent: true, alreadySent: false };
}
