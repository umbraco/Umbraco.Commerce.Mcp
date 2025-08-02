import { StoreStatsDto } from "../../../infrastructure/umbraco-commerce/index.js";
import { StoreStats, storeStatsSchema } from "./store-stats.js";
import { mapToAmount } from "../../../common/types/amount-mappers.js";

/**
 * Maps a StoreStatsDto from the API to a StoreStats for tool responses
 */
export function mapToStoreStats(storeStats: StoreStatsDto) : StoreStats {
    return storeStatsSchema.parse({
        allTimeTotalRevenue: mapToAmount(storeStats.allTimeTotalRevenue),
        allTimeTotalOrders: storeStats.allTimeTotalOrders,
        totalRevenue: mapToAmount(storeStats.totalRevenue),
        totalOrders: storeStats.totalOrders,
        totalNewOrders: storeStats.totalNewOrders,
        totalAuthorizedOrders: storeStats.totalAuthorizedOrders,
        totalCapturedOrders: storeStats.totalCapturedOrders,
        totalRefundedOrders: storeStats.totalRefundedOrders,
        totalErroredOrders: storeStats.totalErroredOrders,
    });
}