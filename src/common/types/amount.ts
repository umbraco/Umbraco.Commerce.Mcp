import { z } from "zod";

export const amountSchema = z.object({
    value: z.number(),
    currency: z.string()
});

export type Amount = z.infer<typeof amountSchema>;