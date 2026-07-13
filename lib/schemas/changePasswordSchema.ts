import { z } from "zod";

export const changePasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
      .max(72, "A palavra-passe não pode ter mais de 72 caracteres."),

    confirmPassword: z.string().min(1, "Confirme a nova palavra-passe.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"]
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
