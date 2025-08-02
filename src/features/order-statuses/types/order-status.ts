import { z } from "zod";

export const orderStatusSchema = z.object({
    id: z.string().uuid(),
    alias: z.string().describe('The unique alias of the order status'),
    name: z.string().describe('The name of the order status'),
    color: z.string().optional().nullable().describe('The color associated with the order status, used for UI representation'),
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;