import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { z } from "zod";
import { Session } from "../../../common/session/types/session.js";
import { Order } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";

const addOrderTagsSchema = storeIdOrAliasRequestSchema.extend({
    orderId: z.string().uuid().describe('The unique identifier of the order to retrieve'),
    tags: z.array(z.string()).describe('The tags to add to the order. This should be an array of strings representing the tags to be appended to the order\'s existing tags.')
});

const addOrderTags = {
    name: 'add_order_tags',
    description: 'Add tags to an existing order. This tool allows you to append additional information or comments to an order identified by its unique ID. The order ID must be a valid UUID. The store is identified by its unique ID or alias.',
    paramsSchema: addOrderTagsSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias, orderId, tags } = args;

        // Get the current order
        const { data: order } = await Order.getOrderById({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            },
            query: {
                fields: 'tags' // Only fetch the tags field to minimize data transfer
            }
        });
        
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found in store ${storeIdOrAlias}`);
        }
        
        // Update the order tags
        const { data } = await Order.updateOrderById({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            },
            body: {
                tags: [
                    ...order.tags || [], // Ensure we start with existing tags if any
                    ...tags
                ]
            }
        });

        return createJsonResult({
            success: !!data
        });
    }

} satisfies ToolDefinition<typeof addOrderTagsSchema.shape>;

export default addOrderTags;