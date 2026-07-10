import { BusinessFormData } from "../schemas/businessFormSchema";
import { supabase } from "../supabase/client";

export async function updateMyBusiness(
  businessId: string,
  data: BusinessFormData,
  logoPath?: string
): Promise<boolean> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const payload = {
    name: data.name,
    category_id: data.category_id,
    description: data.description,
    phone: data.phone,
    email: data.email,
    website: data.website,
    facebook: data.facebook,
    instagram: data.instagram,
    street: data.street,
    number: data.number,
    postal_code: data.postalCode,
    city: data.city,
    ...(logoPath && { logo_url: logoPath })
  };

  const { data: updated, error } = await supabase
    .from("businesses")
    .update(payload)
    .eq("id", businessId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}
