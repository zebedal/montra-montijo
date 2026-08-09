import { z } from "zod";

export const QUOTE_REQUEST_TIMINGS = [
  "as_soon_as_possible",
  "this_week",
  "this_month",
  "flexible"
] as const;

export type QuoteRequestTiming = (typeof QUOTE_REQUEST_TIMINGS)[number];

export const QUOTE_REQUEST_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "completed",
  "archived"
] as const;

export type QuoteRequestStatus = (typeof QUOTE_REQUEST_STATUSES)[number];

export const quoteRequestStatusLabels: Record<QuoteRequestStatus, string> = {
  new: "Novo",
  contacted: "Contactado",
  quoted: "Orçamento enviado",
  completed: "Concluído",
  archived: "Arquivado"
};

export const quoteRequestTimingLabels: Record<QuoteRequestTiming, string> = {
  as_soon_as_possible: "Assim que possível",
  this_week: "Durante esta semana",
  this_month: "Durante este mês",
  flexible: "Tenho flexibilidade"
};

const optionalPhoneSchema = z
  .string()
  .trim()
  .max(30, "O telefone não pode ter mais de 30 caracteres.")
  .refine(
    (value) => !value || value.replace(/\D/g, "").length >= 9,
    "Indique um número de telefone válido."
  );

const optionalEmailSchema = z.union([
  z.literal(""),
  z.string().trim().email("Indique um email válido.").max(160)
]);

export const quoteRequestSchema = z
  .object({
    businessId: z.string().uuid("Negócio inválido."),
    name: z
      .string()
      .trim()
      .min(2, "Indique o seu nome.")
      .max(120, "O nome não pode ter mais de 120 caracteres."),
    phone: optionalPhoneSchema,
    email: optionalEmailSchema,
    description: z
      .string()
      .trim()
      .min(10, "Descreva brevemente o que precisa.")
      .max(1200, "A descrição não pode ter mais de 1200 caracteres."),
    locality: z
      .string()
      .trim()
      .min(2, "Indique a localidade.")
      .max(120, "A localidade não pode ter mais de 120 caracteres."),
    timing: z.enum(QUOTE_REQUEST_TIMINGS, {
      message: "Indique quando pretende o serviço."
    }),
    consent: z.boolean().refine((value) => value, {
      message: "É necessário autorizar a partilha dos dados."
    }),
    website: z.string().max(200)
  })
  .superRefine((data, context) => {
    if (!data.phone && !data.email) {
      const message = "Indique um telefone ou um email.";
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message
      });
      context.addIssue({
        code: "custom",
        path: ["email"],
        message
      });
    }
  });

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

export type QuoteRequestSummaryItem = {
  label: string;
  value: number;
};

function countTopValues(values: string[], limit = 5): QuoteRequestSummaryItem[] {
  const counts = new Map<string, QuoteRequestSummaryItem>();

  values.forEach((value) => {
    const normalized = value.trim();
    if (!normalized) return;
    const key = normalized.toLocaleLowerCase("pt-PT");
    const current = counts.get(key);
    counts.set(key, {
      label: current?.label ?? normalized,
      value: (current?.value ?? 0) + 1
    });
  });

  return [...counts.values()]
    .sort(
      (a, b) => b.value - a.value || a.label.localeCompare(b.label, "pt")
    )
    .slice(0, limit);
}

export function summarizeQuoteRequests(
  requests: { locality: string }[]
) {
  return {
    localities: countTopValues(requests.map((request) => request.locality))
  };
}

export function calculateQuoteRequestConversion(
  quoteRequests: number,
  pageViews: number
) {
  return pageViews > 0 ? (quoteRequests / pageViews) * 100 : 0;
}
