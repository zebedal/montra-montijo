import { z } from "zod";
import { BUSINESS_LOCALITIES } from "@/lib/business-localities";
import { MARGEM_SUL_SERVICE_AREA_SLUGS } from "@/lib/service-areas";

/**
 * OPENING HOURS
 */
export const openingPeriodSchema = z.object({
  open: z.string(),
  close: z.string()
});

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export const openingHourSchema = z
  .object({
    day: z.string(),
    periods: z.array(openingPeriodSchema).max(4),
    closed: z.boolean()
  })
  .superRefine((day, context) => {
    if (day.closed) return;

    if (day.periods.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["periods"],
        message: "Adiciona pelo menos um período ou marca o dia como encerrado."
      });
      return;
    }

    day.periods.forEach((period, index) => {
      if (!period.open) {
        context.addIssue({
          code: "custom",
          path: ["periods", index, "open"],
          message: "Indica a hora de abertura."
        });
      }

      if (!period.close) {
        context.addIssue({
          code: "custom",
          path: ["periods", index, "close"],
          message: "Indica a hora de fecho."
        });
      }

      if (period.open && period.close && period.open === period.close) {
        context.addIssue({
          code: "custom",
          path: ["periods", index, "close"],
          message: "A abertura e o fecho não podem ter a mesma hora."
        });
      }
    });

    if (
      day.periods.some(
        (period) =>
          !period.open || !period.close || period.open === period.close
      )
    ) {
      return;
    }

    const sortedPeriods = [...day.periods].sort((a, b) =>
      a.open.localeCompare(b.open)
    );

    for (let index = 1; index < sortedPeriods.length; index += 1) {
      const previousOpen = timeToMinutes(sortedPeriods[index - 1].open);
      const previousCloseValue = timeToMinutes(sortedPeriods[index - 1].close);
      const previousClose =
        previousCloseValue <= previousOpen
          ? previousCloseValue + 24 * 60
          : previousCloseValue;
      const currentOpen = timeToMinutes(sortedPeriods[index].open);

      if (currentOpen < previousClose) {
        context.addIssue({
          code: "custom",
          path: ["periods"],
          message: "Os períodos do mesmo dia não podem sobrepor-se."
        });
        break;
      }
    }
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
    specialtyIds: z
      .array(z.string().uuid())
      .max(4, "Seleciona no máximo 4 especialidades."),

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
    servesAtCustomerLocation: z.boolean(),
    serviceAreas: z.array(z.enum(MARGEM_SUL_SERVICE_AREA_SLUGS)).max(9),
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

    if (data.servesAtCustomerLocation && data.serviceAreas.length === 0) {
      context.addIssue({
        code: "custom",
        path: ["serviceAreas"],
        message: "Selecione pelo menos uma área onde presta serviços."
      });
    }

    if (!data.hasPhysicalAddress) return;

    if (!data.street) {
      context.addIssue({
        code: "custom",
        path: ["street"],
        message: "Indica a rua."
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
export type OpeningPeriod = z.infer<typeof openingPeriodSchema>;

export function normalizeOpeningHours(value: unknown): OpeningHour[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];

    const legacyItem = item as {
      day?: unknown;
      open?: unknown;
      close?: unknown;
      periods?: unknown;
      closed?: unknown;
    };

    if (typeof legacyItem.day !== "string") return [];

    const periods = Array.isArray(legacyItem.periods)
      ? legacyItem.periods.flatMap((period) => {
          if (!period || typeof period !== "object") return [];

          const candidate = period as { open?: unknown; close?: unknown };

          return [
            {
              open: typeof candidate.open === "string" ? candidate.open : "",
              close:
                typeof candidate.close === "string" ? candidate.close : ""
            }
          ];
        })
      : typeof legacyItem.open === "string" ||
          typeof legacyItem.close === "string"
        ? [
            {
              open: typeof legacyItem.open === "string" ? legacyItem.open : "",
              close:
                typeof legacyItem.close === "string" ? legacyItem.close : ""
            }
          ]
        : [];

    return [
      {
        day: legacyItem.day,
        periods,
        closed: legacyItem.closed === true
      }
    ];
  });
}
