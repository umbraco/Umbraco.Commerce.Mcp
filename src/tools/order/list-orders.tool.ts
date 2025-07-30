import { z } from 'zod';
import { ToolDefinition } from '../../types/tool-definition.js';
import { UserSession } from '../../types/umbraco-user.js';

const listOrdersSchema = z.object({
    page: z.number().min(1).default(1),
    pageSize: z.number().min(1).max(100).default(10),
    status: z.enum(['pending', 'processing', 'completed', 'cancelled']).optional()
});

export default {
    name: 'list_orders',
    description: 'List orders with optional filtering and pagination',
    schema: listOrdersSchema.shape,
    
    isAllowed: (session: UserSession) => {
        return session.hasAccessToSection('commerce');
    },
    
    handler: async (args, context) => {
        const { page, pageSize, status } = args;
        
        // Mock order list - in reality this would use your commerce API
        const mockOrders = Array.from({ length: pageSize }, (_, i) => ({
            id: `order-${page}-${i + 1}`,
            orderNumber: `ORD-${Date.now()}-${i}`,
            customerName: `Customer ${i + 1}`,
            total: Math.round((Math.random() * 500 + 50) * 100) / 100,
            status: status || ['pending', 'processing', 'completed'][i % 3],
            createdDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        const response = {
            orders: mockOrders,
            pagination: {
                page,
                pageSize,
                total: 150, // Mock total
                totalPages: Math.ceil(150 / pageSize)
            },
            filters: status ? { status } : {}
        };
        
        return {
            content: [{
                type: "text",
                text: JSON.stringify(response, null, 2)
            }]
        };
    }
} satisfies ToolDefinition<typeof listOrdersSchema.shape>;