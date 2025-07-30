import { z } from 'zod';
import { ToolDefinition } from '../../types/tool-definition.js';
import { UserSession } from '../../types/umbraco-user.js';

const cancelOrderSchema = z.object({
    orderId: z.string().uuid('Invalid order ID format'),
    reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason too long')
});

export default {
    name: 'cancel_order',
    description: 'Cancel an order with a reason',
    schema: cancelOrderSchema.shape,
    
    isAllowed: (session: UserSession) => {
        // Requires both commerce access and specific permission
        return session.hasAccessToSection('commerce') && 
               session.hasPermission('cancel_orders');
    },
    
    handler: async (args, context) => {
        const { orderId, reason } = args;
        
        // Business logic validation - these are expected errors that should be handled gracefully
        if (orderId === 'invalid-order') {
            throw new Error('Order not found');
        }
        
        if (orderId === 'completed-order') {
            throw new Error('Cannot cancel a completed order');
        }
        
        // Mock successful cancellation
        const cancelledOrder = {
            id: orderId,
            status: 'Cancelled',
            cancellationReason: reason,
            cancelledAt: new Date().toISOString(),
            cancelledBy: 'System' // Would normally use context.session.user.name but context structure varies
        };
        
        return {
            content: [{
                type: "text",
                text: `Order ${orderId} has been cancelled successfully.\n\n${JSON.stringify(cancelledOrder, null, 2)}`
            }]
        };
    }
    
} satisfies ToolDefinition<typeof cancelOrderSchema.shape>;