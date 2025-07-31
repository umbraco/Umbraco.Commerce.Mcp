import { Price, priceSchema } from './price.js';
import { PriceDto } from "../api/index.js";

/**
 * Maps a PriceDto from the API to a Price for tool responses
 * 
 * @param priceObj - The PriceDto object to map
 * @returns A Price object with value and currency
 */
export function mapToPrice(priceObj: PriceDto): Price {
    return priceSchema.parse({
        value: priceObj.withTax,
        currency: priceObj.currency!.code
    });
}