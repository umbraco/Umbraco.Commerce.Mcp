import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { z } from "zod";
import { Session } from "../../../common/session/types/session.js";
import { Order } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";

const addOrderNoteSchema = storeIdOrAliasRequestSchema.extend({
    orderId: z.string().uuid().describe('The unique identifier of the order to retrieve'),
    note: z.string().describe('The note to add to the order')
});

const addOrderNote = {
    name: 'add_order_note',
    description: 'Add a note to an existing order. This tool allows you to append additional information or comments to an order identified by its unique ID. The order ID must be a valid UUID. The store is identified by its unique ID or alias.',
    paramsSchema: addOrderNoteSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias, orderId, note } = args;

        // Get the current order
        const { data: order } = await Order.getOrderById({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            },
            query: {
                fields: 'notes[internalNotes,customerNotes]' // Only fetch the notes field to minimize data transfer
            }
        });
        
        if (!order) {
            throw new Error(`Order with ID ${orderId} not found in store ${storeIdOrAlias}`);
        }
        
        // Update the order notes
        const today = new Date().toISOString().split('T')[0];
        const { data } = await Order.updateOrderById({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            },
            body: {
                notes: {
                    ...order.notes,
                    internalNotes: `${today}:\n`+ note + (order.notes?.internalNotes ? `\n\n`+ order.notes?.internalNotes : '')
                }
            }
        });

        return createJsonResult({
            success: !!data
        });
    }

} satisfies ToolDefinition<typeof addOrderNoteSchema.shape>;

export default addOrderNote;