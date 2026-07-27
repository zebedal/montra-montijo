import { z } from "zod";
import { BUSINESS_LOCALITIES } from "@/lib/business-localities";

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
    priceType: z.enum(["none", "fixed", "from", "quote"]),
    price: z.string()
  })
  .superRefine((service, context) => {
    if (service.priceType === "none" || service.priceType === "quote") return;

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

    hasPhysicalAddress: z.boolean(),
    street: z.string().trim().max(200, "A rua é demasiado longa."),
    number: z
      .string()
      .trim()
      .max(30, "O número e a fração são demasiado longos."),
    postalCode: z.string().trim(),

    city: z.enum(BUSINESS_LOCALITIES, {
      message: "Selecione uma freguesia válida."
    }),
    images: z.array(z.string()),
    logo: z.string().optional(),
    faqs: z.array(businessFaqSchema).max(5, "Podes adicionar até 5 perguntas."),
    services: z
      .array(businessServiceSchema)
      .max(8, "Podes adicionar até 8 serviços."),
    is24Hours: z.boolean(),
    openingHours: z.array(openingHourSchema).optional()
  })
  .superRefine((data, context) => {
    if (data.allowWhatsApp) {
      const digits = data.whatsappPhone?.replace(/\D/g, "") ?? "";

      if (digits.length < 9 || digits.length > 15) {
        context.addIssue({
          code: "custom",
          path: ["whatsappPhone"],
          message: "Indica um número de WhatsApp válido."
        });
      }
    }

    if (!data.hasPhysicalAddress) return;

    if (!data.street) {
      context.addIssue({
        code: "custom",
        path: ["street"],
        message: "Indica a rua."
      });
    }

    if (!data.number) {
      context.addIssue({
        code: "custom",
        path: ["number"],
        message: "Indica o número da porta."
      });
    } else if (!/^\d/i.test(data.number)) {
      context.addIssue({
        code: "custom",
        path: ["number"],
        message: "O número da porta deve começar por um algarismo."
      });
    }

    if (!/^\d{4}-\d{3}$/.test(data.postalCode)) {
      context.addIssue({
        code: "custom",
        path: ["postalCode"],
        message: "O código postal deve ter o formato XXXX-XXX"
      });
    }
  });

export type BusinessFormData = z.infer<typeof businessSchema>;

export type OpeningHour = z.infer<typeof openingHourSchema>;
