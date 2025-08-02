import { Session } from "../../../common/session/types/session.js";
import { Analytics } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { analyticsRequestSchema } from "../types/analytics-request.js";

const getTopSellingProductsAnalyticsTool = {
    name: 'get_top_selling_products_analytics',
    description: `Retrieve the top-selling products for a specific store. This tool provides insights into the most popular products based on sales data, helping to identify trends and customer preferences. The store is identified by its unique ID or alias. This operation is typically used to analyze product performance and inform inventory decisions.`,
    paramsSchema: analyticsRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias } = args;

        const { data } = await Analytics.getTopSellingProducts({
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

export default getTopSellingProductsAnalyticsTool;