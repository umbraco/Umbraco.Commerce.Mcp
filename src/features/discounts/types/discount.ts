import { z } from 'zod';

export const discountCodeSchema = z.object({
    code: z.string(),
    usageLimit: z.number().optional(),
    isUnlimited: z.boolean().default(false),
});

export const discountRuleSchema: z.ZodSchema = z.object({
    ruleProviderAlias: z.string(),
    settings: z.record(z.unknown()).optional(),
    children: z.array(z.lazy(() => discountRuleSchema)).optional(),
});

export const discountRewardSchema: z.ZodSchema = z.object({
    rewardProviderAlias: z.string(),
    settings: z.record(z.unknown()).optional(),
});

export const discountSummarySchema = z.object({
    id: z.string(),
    alias: z.string(),
    name: z.string().optional(),
    type: z.enum(['Automatic', 'Code']),
    status: z.enum(['Active', 'Inactive', 'Scheduled', 'Expired']),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
});

export const discountSchema = discountSummarySchema.extend({
    blockFurtherDiscounts: z.boolean().default(false),
    blockIfPreviousDiscounts: z.boolean().default(false),
    codes: z.array(discountCodeSchema).optional(),
    rules: discountRuleSchema.optional(),
    rewards: z.array(discountRewardSchema).optional()
});

export type DiscountSummary = z.infer<typeof discountSummarySchema>;
export type Discount = z.infer<typeof discountSchema>;