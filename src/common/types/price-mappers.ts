import { Price, priceSchema } from './price.js';
import { PriceDto } from "../../infrastructure/umbraco-commerce/index.js";

/**
 * Maps a PriceDto from the API to a Price for tool responses
 * 
 * @param dto - The PriceDto object to map
 * @returns A Price object with value and currency
 */
export function mapToPrice(dto: PriceDto): Price {
    return priceSchema.parse({
        value: dto.withTax,
        currency: dto.currency!.code
    });
}