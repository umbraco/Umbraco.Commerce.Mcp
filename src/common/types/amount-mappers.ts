import { Amount, amountSchema } from './amount.js';
import { AmountDto } from "../../infrastructure/umbraco-commerce/index.js";

/**
 * Maps a AmountDto from the API to a Amount for tool responses
 * 
 * @param amountObj - The AmountDto object to map
 * @returns A Amount object with value and currency
 */
export function mapToAmount(amountObj: AmountDto): Amount {
    return amountSchema.parse({
        value: amountObj.value!,
        currency: amountObj.currency!.code
    });
}