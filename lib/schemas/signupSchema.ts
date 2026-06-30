import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Password mínima de 6 caracteres")
});
