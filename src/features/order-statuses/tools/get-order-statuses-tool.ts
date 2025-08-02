import { Session } from "../../../common/session/types/session.js";
import { OrderStatus } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { mapToOrderStatus } from "../types/order-status-mappers.js";

const getOrderStatusesTool = {
    name: 'get_order_statuses',
    description: 'Retrieve the list of order statuses for a specific store. This tool provides the available statuses that can be assigned to orders in the store, such as "New", "Completed", "Captured", etc. The store is identified by its unique ID or alias.',
    paramsSchema: storeIdOrAliasRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias } = args;

        const { data } = await OrderStatus.getOrderStatuses({
            headers: {
                store: storeIdOrAlias
            }
        });

        if (!data) {
            throw new Error(`No order statuses found for store with ID or alias "${storeIdOrAlias}".`);
        }

        return createJsonResult(data.map(mapToOrderStatus));
    }

} satisfies ToolDefinition<typeof storeIdOrAliasRequestSchema.shape>;

export default getOrderStatusesTool;