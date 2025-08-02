import { Session } from "../../../common/session/types/session.js";
import { Analytics } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { analyticsRequestSchema } from "../types/analytics-request.js";

const getAverageOrderValueAnalyticsTool = {
    name: 'get_average_order_value_analytics',
    description: `Retrieve the average order value for a specific store. This tool calculates the average value of all orders placed in the store, providing insights into customer spending behavior. The store is identified by its unique ID or alias. This operation is typically used to analyze sales performance and customer purchasing patterns.`,
    paramsSchema: analyticsRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias } = args;

        const { data } = await Analytics.getAverageOrderValue({
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

export default getAverageOrderValueAnalyticsTool;