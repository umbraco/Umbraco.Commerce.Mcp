import { OrderStatusDto } from "../../../infrastructure/umbraco-commerce/index.js";
import { OrderStatus, orderStatusSchema } from "./order-status.js";

/**
 * Maps an OrderStatusDto to the OrderStatus domain model
 *
 * @param orderStatus - The OrderStatusDto to map
 * @returns The mapped OrderStatus domain model
 */
export function mapToOrderStatus(orderStatus: OrderStatusDto): OrderStatus {
    return orderStatusSchema.parse({
        id: orderStatus.id!,
        alias: orderStatus.alias!,
        name: orderStatus.name!,
        color: orderStatus.color || null,
    });
}