import { createClient } from "@/lib/supabase/server";

export type MyProfile = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  createdAt: string | null;
  alternativeEmail: string;
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error(userError);
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name, phone, alternative_email, created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(profileError);
    return null;
  }

  if (!profile) {
    const { data: createdProfile, error: createError } = await supabase
      .from("profiles")
      .insert({
        id: user.id
      })
      .select("id, full_name, phone, created_at, alternative_email")
      .single();

    if (createError) {
      console.error(createError);
      return null;
    }

    return {
      id: createdProfile.id,
      fullName: createdProfile.full_name ?? "",
      phone: createdProfile.phone ?? "",
      email: user.email ?? "",
      createdAt: createdProfile.created_at,
      alternativeEmail: createdProfile.alternative_email
    };
  }

  return {
    id: profile.id,
    fullName: profile.full_name ?? "",
    phone: profile.phone ?? "",
    email: user.email ?? "",
    createdAt: profile.created_at,
    alternativeEmail: profile.alternative_email
  };
}
