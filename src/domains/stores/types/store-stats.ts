import { z } from "zod";
import { amountSchema } from "../../../common/types/amount.js";

export const storeStatsSchema = z.object({
    allTimeTotalRevenue: amountSchema,
    allTimeTotalOrders: z.number(),
    totalRevenue: amountSchema,
    totalOrders: z.number(),
    totalNewOrders: z.number(),
    totalAuthorizedOrders: z.number(),
    totalCapturedOrders: z.number(),
    totalRefundedOrders: z.number(),
    totalErroredOrders: z.number(),
});

export type StoreStats = z.infer<typeof storeStatsSchema>;