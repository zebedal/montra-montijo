import { z } from "zod";

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Indica o teu nome.")
    .max(100, "O nome não pode ter mais de 100 caracteres."),

  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{9}$/.test(value.replace(/\s/g, "")),
      "Indica um número de telefone válido."
    ),

  email: z.string().email("O endereço de email não é válido."),

  alternativeEmail: z
    .string()
    .trim()
    .email("O endereço de email alternativo não é válido.")
    .or(z.literal(""))
});

export type ProfileFormData = z.infer<typeof profileSchema>;
