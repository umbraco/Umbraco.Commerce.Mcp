import { z } from 'zod';
import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';

const getOrderByIdSchema = z.object({
    orderId: z.string().uuid('Invalid order ID format')
});

const getOrderByIdTool = {
    name: 'get_order_by_id',
    description: 'Retrieve an order by its unique identifier',
    paramsSchema: getOrderByIdSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        const { orderId } = args;
        
        // This would normally use your commerce API client
        // For now, return a mock response
        const mockOrder = {
            id: orderId,
            orderNumber: `ORD-${Date.now()}`,
            customerName: 'John Doe',
            total: 99.99,
            status: 'Completed',
            createdDate: new Date().toISOString()
        };
        
        return createJsonResult(mockOrder);
    }
    
} satisfies ToolDefinition<typeof getOrderByIdSchema.shape>;

export default getOrderByIdTool;