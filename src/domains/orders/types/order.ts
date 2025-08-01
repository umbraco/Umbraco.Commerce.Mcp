import { z } from 'zod';
import { priceSchema } from "../../../common/types/price.js";

export const orderSummarySchema = z.object({
    id: z.string().uuid(),
    orderNumber: z.string(),
    customerEmail: z.string().email().optional().nullable(),
    customerName: z.string().optional().nullable(),
    status: z.string(),
    totalPrice: priceSchema,
    finalizedDate: z.string(),
    orderLineCount: z.number().int().min(0)
});

export type OrderSummary = z.infer<typeof orderSummarySchema>;