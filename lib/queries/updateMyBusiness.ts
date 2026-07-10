import { BusinessFormData } from "../schemas/businessFormSchema";
import { supabase } from "../supabase/client";

export async function updateMyBusiness(
  businessId: string,
  data: BusinessFormData,
  logoUrl: string
): Promise<boolean> {
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { data: updated, error } = await supabase
    .from("businesses")
    .update({
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
      logo_url: logoUrl
    })
    .eq("id", businessId)
    .eq("user_id", user.id)
    .select();

  if (error) {
    console.error(error);
    return false;
  }

  return true;
}
