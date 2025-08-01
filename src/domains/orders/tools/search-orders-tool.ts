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
        status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional()
    });

const searchOrdersResponseSchema = createPaginatedSchema(orderSummarySchema)

export default {
    name: 'search_orders',
    description: 'Search orders with optional filtering and pagination',
    paramsSchema: searchOrdersRequestSchema.shape,
    resultSchema: searchOrdersResponseSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        
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