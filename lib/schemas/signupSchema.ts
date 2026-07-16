import { z } from "zod";

export const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "O email é obrigatório.")
      .email("Introduza um endereço de email válido."),

    password: z
      .string()
      .min(8, "A palavra-passe deve ter pelo menos 8 caracteres.")
      .regex(
        /[a-z]/,
        "A palavra-passe deve conter pelo menos uma letra minúscula."
      )
      .regex(
        /[A-Z]/,
        "A palavra-passe deve conter pelo menos uma letra maiúscula."
      )
      .regex(/[0-9]/, "A palavra-passe deve conter pelo menos um número."),

    confirmPassword: z.string().min(1, "Confirme a palavra-passe.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As palavras-passe não coincidem.",
    path: ["confirmPassword"]
  });
