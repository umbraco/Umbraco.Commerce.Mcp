// External dependencies
import { z } from 'zod';
import { priceSchema } from "../../../common/types/price.js";

// =============================================================================
// FOUNDATION SCHEMAS (No Dependencies)
// =============================================================================

export const orderContactSchema = z.object({
    firstName: z.string().optional().nullable(),
    lastName: z.string().optional().nullable(),
    email: z.string().email().optional().nullable()
});

export const orderAddressSchema = z.object({
    addressLine1: z.string().optional().nullable(),
    addressLine2: z.string().optional().nullable(),
    city: z.string().optional().nullable(),
    zipCode: z.string().optional().nullable(),
    countryIsoCode: z.string().optional().nullable(),
});

// =============================================================================
// COMPOSITE SCHEMAS (Building on Foundation)
// =============================================================================

export const orderCompanyAddressSchema = orderAddressSchema.extend({
    companyName: z.string().optional().nullable(),
    companyTaxCode: z.string().optional().nullable(),
});

export const orderCustomerSchema = orderContactSchema.extend({
    customerReference: z.string().optional().nullable(),
});

// =============================================================================
// DOMAIN-SPECIFIC SCHEMAS (Business Logic)
// =============================================================================

export const orderBillingInfoSchema = orderCompanyAddressSchema.extend({
    contact: orderContactSchema.optional().nullable(),
});

export const orderShippingInfoSchema = orderCompanyAddressSchema.extend({
    sameAsBilling: z.boolean().optional().default(false),
    contact: orderContactSchema.optional().nullable(),
    shippingMethod: z.string().optional().nullable(),
    shippingOption: z.string().optional().nullable(),
    totalPrice: priceSchema.optional().nullable().describe('Total fee for shipping, including any adjustments or taxes.'),
});

export const orderPaymentInfoSchema = z.object({
    paymentMethod: z.string().optional().nullable(),
    totalPrice: priceSchema.optional().nullable().describe('Total fee for payment processing, including any adjustments or taxes.'),
});

export const orderLineSchema = z.object({
    id: z.string().uuid(),
    productReference: z.string().optional().nullable(),
    productVariantReference: z.string().optional().nullable(),
    bundleId: z.string().optional().nullable(),
    sku: z.string(),
    name: z.string(),
    basePrice: priceSchema,
    unitPrice: priceSchema,
    quantity: z.number().int().min(1),
    totalPrice: priceSchema,
    attributes: z.record(z.string()).optional(),
    properties: z.record(z.string()).optional()
});

// =============================================================================
// AGGREGATE SCHEMAS (Top-Level Entities)
// =============================================================================

export const orderSummarySchema = z.object({
    id: z.string().uuid(),
    orderNumber: z.string(),
    customer: orderCustomerSchema,
    totalPrice: priceSchema,
    finalizedDate: z.string(),
    totalOrderLines: z.number().int().min(0),
});

export const orderSchema = orderSummarySchema.extend({
    billing: orderBillingInfoSchema.optional().nullable(),
    shipping: orderShippingInfoSchema.optional().nullable(),
    payment: orderPaymentInfoSchema.optional().nullable(),
    discountCodes: z.array(z.string()).optional().default([]),
    orderLines: z.array(orderLineSchema).optional().default([]),
    status: z.string(),
    tags: z.array(z.string()).optional().default([]),
    properties: z.record(z.string()).optional().default({})
});

// =============================================================================
// TYPE EXPORTS
// =============================================================================

// Foundation types
export type OrderContact = z.infer<typeof orderContactSchema>;
export type OrderAddress = z.infer<typeof orderAddressSchema>;

// Composite types
export type OrderCompanyAddress = z.infer<typeof orderCompanyAddressSchema>;
export type OrderCustomer = z.infer<typeof orderCustomerSchema>;

// Domain-specific types
export type OrderBillingInfo = z.infer<typeof orderBillingInfoSchema>;
export type OrderShippingInfo = z.infer<typeof orderShippingInfoSchema>;
export type OrderPaymentInfo = z.infer<typeof orderPaymentInfoSchema>;
export type OrderLine = z.infer<typeof orderLineSchema>;

// Aggregate types
export type OrderSummary = z.infer<typeof orderSummarySchema>;
export type Order = z.infer<typeof orderSchema>;