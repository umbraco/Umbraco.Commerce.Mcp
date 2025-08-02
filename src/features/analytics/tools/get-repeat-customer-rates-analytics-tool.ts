import { Session } from "../../../common/session/types/session.js";
import { Analytics } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { analyticsRequestSchema } from "../types/analytics-request.js";
import { convertUmbracoLocalizationString } from "../../../common/utils.js";

const getRepeatCustomerRatesAnalyticsTool = {
    name: 'get_repeat_customer_rates_analytics',
    description: `Retrieve the repeat customer rates for a specific store. This tool calculates the percentage of customers who have made multiple purchases within a defined period, providing insights into customer loyalty and retention. The store is identified by its unique ID or alias. This operation is typically used to analyze customer engagement and repeat business patterns.`,
    paramsSchema: analyticsRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias } = args;

        const { data } = await Analytics.getRepeatCustomerRates({
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
        
        // Convert localization strings in labels
        const localizationLabelPattern = 'ucAnalytics_repeatCustomerRates(.*)Label';
        data.datasets.forEach(dataset => {
            dataset.name = convertUmbracoLocalizationString(dataset.name, localizationLabelPattern);
            dataset.labels = dataset.labels.map(label => convertUmbracoLocalizationString(label, localizationLabelPattern));
        });

        return createJsonResult(data);
    }

} satisfies ToolDefinition<typeof analyticsRequestSchema.shape>;

export default getRepeatCustomerRatesAnalyticsTool;