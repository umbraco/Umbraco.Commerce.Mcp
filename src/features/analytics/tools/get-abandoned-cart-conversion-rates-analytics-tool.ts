import { Session } from "../../../common/session/types/session.js";
import { Analytics } from "../../../infrastructure/umbraco-commerce/index.js";
import { createJsonResult } from "../../../common/mcp/tools/tool-result-helpers.js";
import { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";
import { analyticsRequestSchema } from "../types/analytics-request.js";
import { convertUmbracoLocalizationString } from "../../../common/utils.js";

const getAbandonedCartConversionRatesAnalyticsTool = {
    name: 'get_abandoned_cart_conversion_rates_analytics',
    description: `Retrieve the conversion rates for abandoned carts in a specific store. This tool provides insights into how many abandoned carts were converted into completed orders, helping to analyze the effectiveness of recovery strategies. The store is identified by its unique ID or alias. This operation is typically used to evaluate the success of abandoned cart recovery efforts and customer engagement strategies.`,
    paramsSchema: analyticsRequestSchema.shape,

    canAccess: (session: Session) => session.hasAccessToSection('commerce'),

    execute: async (args, context) => {

        const { storeIdOrAlias } = args;

        const { data } = await Analytics.getAbandonedCartConversionRates({
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
        const localizationLabelPattern = 'ucAnalytics_abandonedCartConversionRates(.*)Label';
        data.datasets.forEach(dataset => {
            dataset.name = convertUmbracoLocalizationString(dataset.name, localizationLabelPattern);
            dataset.labels = dataset.labels.map(label => convertUmbracoLocalizationString(label, localizationLabelPattern));
        });

        return createJsonResult(data);
    }

} satisfies ToolDefinition<typeof analyticsRequestSchema.shape>;

export default getAbandonedCartConversionRatesAnalyticsTool;