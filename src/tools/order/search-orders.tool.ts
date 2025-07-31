import { z } from 'zod';
import { ToolDefinition } from '../../types/tool-definition.js';
import { UserSession } from '../../types/user-session.js';
import { createJsonResult } from '../../utils/tool-result-helpers.js';
import { createPaginatedSchema, paginationRequestSchema } from "../../types/pagination.js";
import { orderSummarySchema } from "../../types/order.js";
import { Order } from "../../api/index.js";
import { storeIdOrAliasRequestSchema } from "../../types/store.js";
import { mapToOrderSummaries } from "../../types/order-mappers.js";

const searchOrdersRequestSchema = storeIdOrAliasRequestSchema
    .merge(paginationRequestSchema)
    .extend({
        status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional()
    });

const searchOrdersResponseSchema = createPaginatedSchema(orderSummarySchema)

export default {
    name: 'search_orders',
    description: 'Search orders with optional filtering and pagination',
    inputSchema: searchOrdersRequestSchema.shape,
    outputSchema: searchOrdersResponseSchema.shape,
    
    isAllowed: (session: UserSession) => session.hasAccessToSection('commerce'),
    
    handler: async (args, context) => {
        
        const { page, pageSize } = args;
        
        const { data } = await Order.getOrders({
            headers: {
                store: args.storeIdOrAlias
            },
            query: {
                skip: (page - 1) * pageSize,
                take: pageSize,
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