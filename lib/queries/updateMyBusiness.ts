import { BusinessFormData } from "../schemas/businessFormSchema";
import { supabase } from "../supabase/client";
import { createSlug } from "../utils";

type UpdatedBusiness = {
  id: string;
  name: string;
  slug: string;
};

export async function updateMyBusiness(
  businessId: string,
  data: BusinessFormData,
  logoPath?: string
): Promise<UpdatedBusiness | null> {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const slug = createSlug(`${data.name}-${data.city}`);

  const payload = {
    name: data.name,
    slug,
    category_id: data.category_id,
    description: data.description,
    phone: data.phone,
    whatsapp_phone: data.allowWhatsApp
      ? data.whatsappPhone?.trim() || null
      : null,
    email: data.email,
    website: data.website,
    facebook: data.facebook,
    instagram: data.instagram,
    street: data.street,
    number: data.number,
    postal_code: data.postalCode,
    city: data.city,
    ...(logoPath ? { logo_url: logoPath } : {})
  };

  const { data: updatedBusiness, error: updateError } = await supabase
    .from("businesses")
    .update(payload)
    .eq("id", businessId)
    .eq("user_id", user.id)
    .select("id, name, slug")
    .single();

  if (updateError) {
    console.error("Erro ao atualizar negócio:", updateError);
    return null;
  }

  const { error: deleteHoursError } = await supabase
    .from("business_hours")
    .delete()
    .eq("business_id", businessId);

  if (deleteHoursError) {
    console.error("Erro ao remover horários:", deleteHoursError);
    return null;
  }

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
      console.error("Erro ao inserir horários:", insertHoursError);
      return null;
    }
  }

  const { error: deleteFaqsError } = await supabase
    .from("business_faqs")
    .delete()
    .eq("business_id", businessId);

  if (deleteFaqsError) {
    console.error("Erro ao remover perguntas frequentes:", deleteFaqsError);
    return null;
  }

  if (data.faqs.length > 0) {
    const { error: insertFaqsError } = await supabase
      .from("business_faqs")
      .insert(
        data.faqs.map((faq, index) => ({
          business_id: businessId,
          question: faq.question.trim(),
          answer: faq.answer.trim(),
          position: index
        }))
      );

    if (insertFaqsError) {
      console.error("Erro ao guardar perguntas frequentes:", insertFaqsError);
      return null;
    }
  }

  const { error: deleteServicesError } = await supabase
    .from("business_services")
    .delete()
    .eq("business_id", businessId);

  if (deleteServicesError) {
    console.error("Erro ao remover serviços:", deleteServicesError);
    return null;
  }

  if (data.services.length > 0) {
    const { error: insertServicesError } = await supabase
      .from("business_services")
      .insert(
        data.services.map((service, index) => ({
          business_id: businessId,
          name: service.name.trim(),
          description: service.description.trim() || null,
          price_type: service.priceType,
          price:
            service.priceType === "quote"
              ? null
              : Number(service.price.replace(",", ".")),
          position: index
        }))
      );

    if (insertServicesError) {
      console.error("Erro ao guardar serviços:", insertServicesError);
      return null;
    }
  }

  return updatedBusiness;
}
