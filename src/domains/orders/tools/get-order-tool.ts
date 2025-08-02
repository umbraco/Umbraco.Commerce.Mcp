import { z } from 'zod';
import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
import { Order } from "../../../infrastructure/umbraco-commerce/index.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { mapToOrder } from "../types/order-mappers.js";

const getOrderByIdSchema = storeIdOrAliasRequestSchema.extend({
    orderId: z.string().uuid().describe('The unique identifier of the order to retrieve')
});

const getOrderTool = {
    name: 'get_order',
    description: 'Retrieve an order by its unique identifier. The order ID must be a valid UUID. This tool allows you to fetch detailed information about a specific order in the store.',
    paramsSchema: getOrderByIdSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        
        const { storeIdOrAlias, orderId } = args;

        const { data } = await Order.getOrderById({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            }
        });
        
        if (!data) {
            throw new Error(`Order with ID ${orderId} not found in store ${storeIdOrAlias}`);
        }
        
        const mapped = mapToOrder(data);
        
        return createJsonResult(mapped);
    }
    
} satisfies ToolDefinition<typeof getOrderByIdSchema.shape>;

export default getOrderTool;