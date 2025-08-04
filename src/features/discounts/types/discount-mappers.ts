import { Discount, DiscountSummary } from './discount.js';
import { discountSchema, discountSummarySchema } from './discount.js';
import { DiscountDto } from '../../../infrastructure/umbraco-commerce/index.js';

export function mapToDiscountSummary(dto: DiscountDto): DiscountSummary {
    return discountSummarySchema.parse({
        id: dto.id,
        alias: dto.alias,
        name: dto.name,
        type: dto.type,
        status: dto.status,
        startDate: dto.startDate,
        expiryDate: dto.expiryDate
    });
}

export function mapToDiscount(dto: DiscountDto): Discount {
    return discountSchema.parse({
        ...mapToDiscountSummary(dto),
        blockFurtherDiscounts: dto.blockFurtherDiscounts,
        blockIfPreviousDiscounts: dto.blockIfPreviousDiscounts,
        codes: dto.codes,
        rules: dto.rules,
        rewards: dto.rewards
    });
}