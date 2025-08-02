import { z } from "zod";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";

export const analyticsRequestSchema = storeIdOrAliasRequestSchema.extend({
    from: z.string().datetime().describe('Start date for the analytics data range'),
    to: z.string().datetime().describe('End date for the analytics data range'),
    compareFrom: z.string().datetime().optional().nullable().describe('Start date for the comparison period'),
    compareTo: z.string().datetime().optional().nullable().describe('End date for the comparison period'),
    localTimezoneOffset: z.number().describe('Local timezone offset in minutes'),
    localCulture: z.string().describe('Local culture identifier for formatting dates and numbers'),
});

export type AnalyticsRequest = z.infer<typeof analyticsRequestSchema>;