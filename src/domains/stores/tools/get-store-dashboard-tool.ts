import { Session } from "../../../common/session/types/session.js";
import { Store } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { z } from "zod";

const getStoreDashboardRequestSchema = storeIdOrAliasRequestSchema
    .extend({
        date: z.string().describe('Date for which to retrieve the dashboard data. Format: yyyy-MM-dd.'),
        localTimezoneOffset: z.number().describe('Timezone offset in minutes for the local timezone. Used to adjust date calculations.'),
    });

const getStoreDashboardTool = {
    name: 'get_store_dashboard',
    description: `Retrieve the dashboard information for a specific store. This tool provides an overview of the store\'s performance, including total sales, number of orders, and customer statistics. The store is identified by its unique ID or alias.
    
    - Authorized orders require payment capturing.
    - Captured orders have payment completed and are ready for fulfillment.
    - Errored orders indicate issues with payment processing.`,
    paramsSchema: getStoreDashboardRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias, date, localTimezoneOffset } = args;

        const { data } = await Store.getStoreStatsByIdOrAlias({
            path: {
                storeIdOrAlias
            },
            body: {
                date,
                localTimezoneOffset
            }
        });

        if (!data) {
            throw new Error(`Store with ID or alias "${storeIdOrAlias}" not found.`);
        }

        return createJsonResult({
            ...data,
            allTimeTotalRevenue: {
                value: data.allTimeTotalRevenue.value,
                currency: data.allTimeTotalRevenue.currency!.code
            },
            totalRevenue: {
                value: data.totalRevenue.value,
                currency: data.totalRevenue.currency!.code
            }
        });
    }

} satisfies ToolDefinition<typeof getStoreDashboardRequestSchema.shape>;

export default getStoreDashboardTool;