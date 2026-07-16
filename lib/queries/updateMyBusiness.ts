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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  /**
   * Atualizar horários
   */

  // Remover horários existentes
  const { error: deleteHoursError } = await supabase
    .from("business_hours")
    .delete()
    .eq("business_id", businessId);

  if (deleteHoursError) {
    console.error(deleteHoursError);
    return false;
  }

  // Inserir novos horários
  if (data.openingHours && data.openingHours.length > 0) {
    const { error: insertHoursError } = await supabase
      .from("business_hours")
      .insert(
        data.openingHours.map((hour) => ({
          business_id: businessId,
          day: hour.day,
          open_time: hour.closed ? null : hour.open,
          close_time: hour.closed ? null : hour.close,
          is_closed: hour.closed
        }))
      );

    if (insertHoursError) {
      console.error(insertHoursError);
      return false;
    }
  }

  return true;
}
