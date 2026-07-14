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

/**
 * BUSINESS
 */
export const businessSchema = z.object({
  name: z.string().min(2, "Indica o nome do negócio."),

  category_id: z.string().min(1, "Selecione uma categoria válida."),

  description: z
    .string()
    .min(20, "A descrição deve ter pelo menos 20 caracteres."),

  phone: z.string().min(9, "Número de telefone inválido."),

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
  openingHours: z.array(openingHourSchema).optional()
});

export type BusinessFormData = z.infer<typeof businessSchema>;

export type OpeningHour = z.infer<typeof openingHourSchema>;
