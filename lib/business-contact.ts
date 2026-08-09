export function getBusinessWhatsAppUrl(
  phone: string,
  businessName: string
) {
  let digits = phone.replace(/\D/g, "");

  if (digits.length === 9) {
    digits = `351${digits}`;
  }

  const message = `Olá! Encontrei ${businessName} na Montra Montijo e gostaria de pedir mais informações.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
