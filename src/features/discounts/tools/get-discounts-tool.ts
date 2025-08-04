import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
import { Discount } from "../../../infrastructure/umbraco-commerce/index.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { mapToDiscountSummary } from "../types/discount-mappers.js";

const getDiscountsRequestSchema = storeIdOrAliasRequestSchema;

const getDiscountsTool = {
    name: 'get_discounts',
    description: `Retrieve all discounts for a specific store.`,
    
    paramsSchema: getDiscountsRequestSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        
        const { storeIdOrAlias } = args;

        const { data } = await Discount.getDiscounts({
            headers: {
                store: storeIdOrAlias
            }
        });
        
        return createJsonResult(data.map(mapToDiscountSummary));
    }
} satisfies ToolDefinition<typeof getDiscountsRequestSchema.shape>;

export default getDiscountsTool;