import { z } from "zod";

export const updatePasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
      .max(72, "A palavra-passe não pode ter mais de 72 caracteres."),

    confirmPassword: z.string().min(1, "Confirme a nova palavra-passe.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"]
  });

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;
