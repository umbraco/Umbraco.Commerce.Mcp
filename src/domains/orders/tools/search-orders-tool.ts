import { z } from 'zod';
import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
import { createPaginatedSchema, paginationRequestSchema } from "../../../common/types/pagination.js";
import { orderSummarySchema } from "../types/order.js";
import { Order } from "../../../infrastructure/umbraco-commerce/index.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { mapToOrderSummaries } from "../types/order-mappers.js";

const searchOrdersRequestSchema = storeIdOrAliasRequestSchema
    .merge(paginationRequestSchema)
    .extend({
        filter: z.array(z.string()).optional().describe('Array of filter strings in format "key:value". See tool description for supported filters.')
    });

const searchOrdersResponseSchema = createPaginatedSchema(orderSummarySchema)

export default {
    name: 'search_orders',
    description: `Search orders with optional filtering and pagination.

SUPPORTED FILTERS:
Use the 'filters' parameter with an array of strings in "key:value" format:

Customer Filters:
- customerFirstName:john - Filter by customer first name (partial match).
- customerLastName:doe - Filter by customer last name (partial match).
- customerEmailAddress:john@example.com - Filter by exact customer email.

Date Filters:
- placedBefore:2025-12-31 - Orders placed before date (yyyy-MM-ddTHH:mm:ssZ).
- placedAfter:2025-12-31 - Orders finalized before date (yyyy-MM-ddTHH:mm:ssZ).

Order Properties:
- orderNumber:ORDER-01982-28796-ZVTT6 - Filter by order number (partial match).
- props:size:xl,color:!blue, - Filter by order properties using a comma-separated key:value format. To exclude a value, prefix it with an exclamation mark (!).
- tags:tag1,tag2 - Filter by order tags (exact match).

Order Line Properties:
- skus:SKU123,SKU456 - Filter by order line SKUs (exact match).
- orderlineProps:color:red,size:!large - Filter by order line properties using a comma-separated key:value format. To exclude a value, prefix it with an exclamation mark (!).

Example: ["customerFirstName:mike", "tags:dispatched", "placedAfter:2025-01-01T10:00:00Z"]`,
    paramsSchema: searchOrdersRequestSchema.shape,
    resultSchema: searchOrdersResponseSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        
        const { page, pageSize, filter } = args;
        
        const { data } = await Order.getOrders({
            headers: {
                store: args.storeIdOrAlias
            },
            query: {
                skip: (page - 1) * pageSize,
                take: pageSize,
                filter
            }
        });
        
        if (!data) {
            return createJsonResult({ orders: [], pagination: { page, pageSize, total: 0, totalPages: 0 }, filters: {} });
        }
        
        const response = {
            items: mapToOrderSummaries(data.items),
            page,
            pageSize,
            totalPages: Math.ceil(data.total / pageSize),
            totalItems: data.total,
        };
        
        return createJsonResult(response);
    }
} satisfies ToolDefinition<typeof searchOrdersRequestSchema.shape, typeof searchOrdersResponseSchema.shape>;