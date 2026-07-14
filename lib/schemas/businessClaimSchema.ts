import { z } from "zod";

export const businessClaimSchema = z.object({
  businessId: z.string().uuid("O negócio indicado não é válido."),

  fullName: z
    .string()
    .trim()
    .min(2, "Introduza o seu nome completo.")
    .max(120, "O nome não pode ter mais de 120 caracteres."),

  roleInBusiness: z.enum(["owner", "manager", "employee", "agency", "other"], {
    message: "Selecione a sua relação com o negócio."
  }),

  phone: z
    .string()
    .trim()
    .max(30, "O telefone não pode ter mais de 30 caracteres.")
    .optional(),

  message: z
    .string()
    .trim()
    .max(1000, "A mensagem não pode ter mais de 1000 caracteres.")
    .optional()
});

export type BusinessClaimFormData = z.infer<typeof businessClaimSchema>;
