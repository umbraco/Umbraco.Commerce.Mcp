import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { z } from "zod";
import { Session } from "../../../common/session/types/session.js";
import { Order } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";

const refundOrderPaymentSchema = storeIdOrAliasRequestSchema.extend({
    orderId: z.string().uuid().describe('The unique identifier of the order to retrieve'),
    amount: z.number().describe('The amount to refund. This should be a positive number representing the total amount to refund for the order.'),
    orderLines: z.array(z.object({
        orderLineId: z.string().uuid().describe('The unique identifier of the order line to refund'),
        quantity: z.number().describe('The quantity of the order line to refund. This should be a positive integer representing the number of items to refund from the order line.')
    })).optional().describe('An array of order lines to refund.'),
    restockProducts: z.boolean().default(false).describe('Whether to restock products after refunding. Defaults to false.'),
});

const refundOrderPayment = {
    name: 'refund_order_payment',
    description: 'Refund a payment for an existing order. This tool allows you to refund the payment for an order identified by its unique ID. The order ID must be a valid UUID. The store is identified by its unique ID or alias. This operation is typically used to process refunds after an order has been captured.',
    paramsSchema: refundOrderPaymentSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias, orderId } = args;

        // Get the current order
        const { data } = await Order.refundOrderPaymentByIdV2({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            },
            body: {
                refundAmount: args.amount,
                orderLines: args.orderLines?.map(line => ({
                    orderLineId: line.orderLineId,
                    quantity: line.quantity
                })),
                restockProducts: args.restockProducts
            }
        });

        return createJsonResult({
            success: !!data
        });
    }

} satisfies ToolDefinition<typeof refundOrderPaymentSchema.shape>;

export default refundOrderPayment;