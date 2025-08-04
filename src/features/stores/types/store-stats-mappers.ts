import { StoreStatsDto } from "../../../infrastructure/umbraco-commerce/index.js";
import { StoreStats, storeStatsSchema } from "./store-stats.js";
import { mapToAmount } from "../../../common/types/amount-mappers.js";

/**
 * Maps a StoreStatsDto from the API to a StoreStats for tool responses
 */
export function mapToStoreStats(dto: StoreStatsDto) : StoreStats {
    return storeStatsSchema.parse({
        allTimeTotalRevenue: mapToAmount(dto.allTimeTotalRevenue),
        allTimeTotalOrders: dto.allTimeTotalOrders,
        totalRevenue: mapToAmount(dto.totalRevenue),
        totalOrders: dto.totalOrders,
        totalNewOrders: dto.totalNewOrders,
        totalAuthorizedOrders: dto.totalAuthorizedOrders,
        totalCapturedOrders: dto.totalCapturedOrders,
        totalRefundedOrders: dto.totalRefundedOrders,
        totalErroredOrders: dto.totalErroredOrders,
    });
}