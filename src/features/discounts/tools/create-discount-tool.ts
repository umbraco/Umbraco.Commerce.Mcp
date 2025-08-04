// import { z } from 'zod';
// import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
// import { Session } from '../../../common/session/types/session.js';
// import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
// import { Discount, DiscountType } from "../../../infrastructure/umbraco-commerce/index.js";
// import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
// import { mapToDiscount } from "../types/discount-mappers.js";
// import { discountCodeSchema, discountRewardSchema, discountRuleSchema } from "../types/discount.js";
//
// const createDiscountRequestSchema = storeIdOrAliasRequestSchema.extend({
//     alias: z.string().describe('Unique alias for the discount (used for programmatic identification)'),
//     name: z.string().describe('Display name for the discount'),
//     type: z.enum(['Automatic', 'Code']).describe('Type of discount: "Automatic" (applied automatically) or "Code" (requires discount code)'),
//     codes: z.array(discountCodeSchema).optional().describe('Discount codes (required for Code type discounts)'),
//     rules: discountRuleSchema.optional().describe('Conditions that must be met for the discount to apply'),
//     rewards: z.array(discountRewardSchema).optional().describe('Rewards given when the discount is applied'),
//     blockFurtherDiscounts: z.boolean().default(false).describe('Prevent other discounts from being applied after this one'),
//     blockIfPreviousDiscounts: z.boolean().default(false).describe('Prevent this discount if other discounts have already been applied'),
//     startDate: z.string().optional().describe('Start date for the discount (ISO 8601 format, e.g., "2025-01-01T00:00:00Z")'),
//     expiryDate: z.string().optional().describe('Expiry date for the discount (ISO 8601 format, e.g., "2025-12-31T23:59:59Z")'),
//     isActive: z.boolean().default(true).describe('Whether the discount is active'),
// });
//
// const createDiscountTool = {
//     name: 'create_discount',
//     description: `Create a new discount in the store.
//    
// This tool allows you to create either automatic discounts (applied automatically to qualifying orders) or code-based discounts (require a discount code to be entered).
//
// Required fields:
// - alias: Unique identifier for the discount
// - name: Display name shown to users
// - type: "Automatic" or "Code" (If "Code", you must provide discount codes)
//
// Optional configuration:
// - codes: Required for "Code" type discounts
// - isActive: Enable/disable the discount (default: true)
// - blockFurtherDiscounts: Prevent additional discounts after this one
// - blockIfPreviousDiscounts: Skip this discount if others already applied
// - startDate/expiryDate: Schedule the discount for specific periods
//
// Note: This creates a basic discount structure. Use additional tools to configure rules (conditions) and rewards (what the discount gives) after creation.
//
// Example: Create a 10% off code discount that expires at year end`,
//    
//     paramsSchema: createDiscountRequestSchema.shape,
//    
//     canAccess: (session: Session) => session.hasAccessToSection('commerce'),
//    
//     execute: async (args, context) => {
//         const { storeIdOrAlias, codes, ...discountData } = args;
//
//         // Validate that Code type discounts have codes
//         if (discountData.type === 'Code' && (!codes || codes.length === 0)) {
//             throw new Error('Code type discounts must have at least one discount code');
//         }
//
//         // Validate that Automatic type discounts don't have codes
//         if (discountData.type === 'Automatic' && codes && codes.length > 0) {
//             throw new Error('Automatic type discounts should not have discount codes');
//         }
//
//         const { data } = await Discount.createDiscount({
//             headers: {
//                 store: storeIdOrAlias
//             },
//             body: {
//                 ...discountData,
//                 type: discountData.type as DiscountType,
//             }
//         });
//        
//         if (!data) {
//             throw new Error('Failed to create discount');
//         }
//        
//         const mapped = mapToDiscount(data);
//        
//         return createJsonResult(mapped);
//     }
//    
// } satisfies ToolDefinition<typeof createDiscountRequestSchema.shape>;
//
// export default createDiscountTool;