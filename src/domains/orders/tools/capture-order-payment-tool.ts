import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { z } from "zod";
import { Session } from "../../../common/session/types/session.js";
import { Order } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";

const captureOrderPaymentSchema = storeIdOrAliasRequestSchema.extend({
    orderId: z.string().uuid().describe('The unique identifier of the order to retrieve')
});

const captureOrderPayment = {
    name: 'capture_order_payment',
    description: 'Capture a payment for an existing order. This tool allows you to capture the payment for an order identified by its unique ID. The order ID must be a valid UUID. The store is identified by its unique ID or alias. This operation is typically used after an order has been authorized but not yet captured.',
    paramsSchema: captureOrderPaymentSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias, orderId } = args;

        // Get the current order
        const { data } = await Order.captureOrderPaymentById({
            headers: {
                store: storeIdOrAlias
            },
            path: {
                orderId
            }
        });

        return createJsonResult({
            success: !!data
        });
    }

} satisfies ToolDefinition<typeof captureOrderPaymentSchema.shape>;

export default captureOrderPayment;