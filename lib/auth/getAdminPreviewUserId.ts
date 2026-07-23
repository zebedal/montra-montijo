import { createClient } from "@/lib/supabase/server";

export async function getAdminPreviewUserId() {
  const adminUserId = process.env.ADMIN_USER_ID;

  if (!adminUserId) return null;

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user?.id === adminUserId ? user.id : null;
}
