import { z } from 'zod';
import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
import { Discount } from "../../../infrastructure/umbraco-commerce/index.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { mapToDiscount } from "../types/discount-mappers.js";

const getDiscountByIdOrAliasSchema = storeIdOrAliasRequestSchema.extend({
    discountIdOrAlias: z.string().describe('The unique identifier (UUID) or alias of the discount to retrieve')
});

const getDiscountTool = {
    name: 'get_discount',
    description: 'Retrieve a discount by its unique identifier or alias. This tool allows you to fetch detailed information about a specific discount in the store, including its rules, rewards, codes, and configuration settings.',
    paramsSchema: getDiscountByIdOrAliasSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        const { storeIdOrAlias, discountIdOrAlias } = args;

        const { data } = await Discount.getDiscountByIdOrAlias({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                discountIdOrAlias
            }
        });
        
        if (!data) {
            throw new Error(`Discount with ID or alias "${discountIdOrAlias}" not found in store ${storeIdOrAlias}`);
        }
        
        const mapped = mapToDiscount(data);
        
        return createJsonResult(mapped);
    }
    
} satisfies ToolDefinition<typeof getDiscountByIdOrAliasSchema.shape>;

export default getDiscountTool;