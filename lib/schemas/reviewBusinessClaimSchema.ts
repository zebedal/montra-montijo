import { z } from "zod";

export const reviewBusinessClaimSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("approve"),
    rejectionReason: z.undefined().optional()
  }),

  z.object({
    action: z.literal("reject"),
    rejectionReason: z
      .string()
      .trim()
      .min(3, "Indique o motivo da rejeição.")
      .max(500, "O motivo não pode ter mais de 500 caracteres.")
  })
]);

export type ReviewBusinessClaimData = z.infer<typeof reviewBusinessClaimSchema>;
