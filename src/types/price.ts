import { z } from "zod";

export const priceSchema = z.object({
    value: z.number(),
    currency: z.string()
});

export type Price = z.infer<typeof priceSchema>;