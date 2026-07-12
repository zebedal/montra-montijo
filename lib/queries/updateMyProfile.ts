import type { ProfileFormData } from "@/lib/schemas/profileSchema";
import { supabase } from "@/lib/supabase/client";

export async function updateMyProfile(data: ProfileFormData): Promise<boolean> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(userError);
    return false;
  }

  const { data: updatedProfile, error } = await supabase
    .from("profiles")
    .update({
      full_name: data.fullName.trim(),
      phone: data.phone.trim() || null,
      alternative_email: data.alternativeEmail?.trim() || null
    })
    .eq("id", user.id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error(error);
    return false;
  }

  if (!updatedProfile) {
    console.error("O perfil não foi atualizado.");
    return false;
  }

  return true;
}
