import { z } from "zod";

/**
 * OPENING HOURS
 */
export const openingHourSchema = z.object({
  day: z.string(),
  open: z.string().optional(),
  close: z.string().optional(),
  closed: z.boolean()
});

export const businessFaqSchema = z.object({
  question: z
    .string()
    .trim()
    .min(5, "A pergunta deve ter pelo menos 5 caracteres.")
    .max(160, "A pergunta não pode exceder 160 caracteres."),
  answer: z
    .string()
    .trim()
    .min(5, "A resposta deve ter pelo menos 5 caracteres.")
    .max(1000, "A resposta não pode exceder 1000 caracteres.")
});

export const businessServiceSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "O nome deve ter pelo menos 2 caracteres.")
      .max(100, "O nome não pode exceder 100 caracteres."),
    description: z
      .string()
      .trim()
      .max(300, "A descrição não pode exceder 300 caracteres."),
    priceType: z.enum(["fixed", "from", "quote"]),
    price: z.string()
  })
  .superRefine((service, context) => {
    if (service.priceType === "quote") return;

    const normalizedPrice = service.price.trim().replace(",", ".");
    const price = Number(normalizedPrice);

    if (!normalizedPrice || !Number.isFinite(price) || price < 0) {
      context.addIssue({
        code: "custom",
        path: ["price"],
        message: "Indica um preço válido."
      });
    }
  });

/**
 * BUSINESS
 */
export const businessSchema = z
  .object({
    name: z.string().min(2, "Indica o nome do negócio."),

    category_id: z.string().min(1, "Selecione uma categoria válida."),

    description: z
      .string()
      .min(20, "A descrição deve ter pelo menos 20 caracteres."),

    phone: z.string().min(9, "Número de telefone inválido."),
    allowWhatsApp: z.boolean(),
    whatsappPhone: z.string().optional().or(z.literal("")),

    email: z.string().email().optional().or(z.literal("")),

    website: z.string().optional().or(z.literal("")),
    facebook: z.string().optional().or(z.literal("")),
    instagram: z.string().optional().or(z.literal("")),

    street: z.string().min(1, "A rua é obrigatória."),
    number: z.string().min(1, "O número é obrigatório."),
    postalCode: z
      .string()
      .regex(/^\d{4}-\d{3}$/, "O código postal deve ter o formato XXXX-XXX"),

    city: z.string().optional().or(z.literal("")),
    images: z.array(z.string()),
    logo: z.string().optional(),
    faqs: z.array(businessFaqSchema).max(5, "Podes adicionar até 5 perguntas."),
    services: z
      .array(businessServiceSchema)
      .max(8, "Podes adicionar até 8 serviços."),
    openingHours: z.array(openingHourSchema).optional()
  })
  .superRefine((data, context) => {
    if (!data.allowWhatsApp) return;

    const digits = data.whatsappPhone?.replace(/\D/g, "") ?? "";

    if (digits.length < 9 || digits.length > 15) {
      context.addIssue({
        code: "custom",
        path: ["whatsappPhone"],
        message: "Indica um número de WhatsApp válido."
      });
    }
  });

export type BusinessFormData = z.infer<typeof businessSchema>;

export type OpeningHour = z.infer<typeof openingHourSchema>;
