import { OrderSummary, orderSummarySchema } from './order.js';
import { mapToPrice } from './price-mappers.js';
import type { OrderDto } from '../api/index.js';

/**
 * Maps multiple orders efficiently
 */
export function mapToOrderSummaries(orders: OrderDto[]): OrderSummary[] {
    return orders.map(mapToOrderSummary);
}

/**
 * Maps an OrderDto from the API to an OrderSummary for tool responses
 */
export function mapToOrderSummary(order: OrderDto): OrderSummary {
    return orderSummarySchema.parse({
        id: order.id!,
        orderNumber: order.orderNumber || 'N/A',
        customerName: buildCustomerName(order.customer?.firstName, order.customer?.lastName) || "Anonymous",
        customerEmail: order.customer?.email || null,
        status: order.orderStatus?.alias || 'unknown',
        totalPrice: mapToPrice(order.totalPrice!.value!),
        finalizedDate: order.finalizedDate!,
        orderLineCount: order.orderLines?.length || 0,
    });
}

/**
 * Safely builds customer name from first and last name
 */
function buildCustomerName(firstName?: string | null, lastName?: string | null): string | null {
    const parts = [firstName, lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : null;
}