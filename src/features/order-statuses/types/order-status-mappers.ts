import { OrderStatusDto } from "../../../infrastructure/umbraco-commerce/index.js";
import { OrderStatus, orderStatusSchema } from "./order-status.js";

/**
 * Maps an OrderStatusDto to the OrderStatus domain model
 *
 * @param dto - The OrderStatusDto to map
 * @returns The mapped OrderStatus domain model
 */
export function mapToOrderStatus(dto: OrderStatusDto): OrderStatus {
    return orderStatusSchema.parse({
        id: dto.id!,
        alias: dto.alias!,
        name: dto.name!,
        color: dto.color || null,
    });
}