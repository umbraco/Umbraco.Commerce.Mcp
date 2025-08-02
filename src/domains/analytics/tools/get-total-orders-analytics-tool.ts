import { Session } from "../../../common/session/types/session.js";
import { Analytics } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { analyticsRequestSchema } from "../types/analytics-request.js";

const getTotalOrdersAnalyticsTool = {
    name: 'get_total_orders_analytics',
    description: `Retrieve the total number of orders for a specific store. This tool provides the total count of all orders placed in the store, which is useful for understanding overall sales volume and customer engagement. The store is identified by its unique ID or alias. This operation is typically used to analyze sales performance and order trends.`,
    paramsSchema: analyticsRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias } = args;

        const { data } = await Analytics.getTotalOrders({
            headers: {
                store: storeIdOrAlias
            },
            body: {
                ...args
            }
        });

        if (!data) {
            throw new Error(`Store with ID or alias "${storeIdOrAlias}" not found or no data available.`);
        }

        return createJsonResult(data);
    }

} satisfies ToolDefinition<typeof analyticsRequestSchema.shape>;

export default getTotalOrdersAnalyticsTool;