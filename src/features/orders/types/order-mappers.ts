// Type imports
import {
    Order,
    OrderAddress,
    OrderBillingInfo,
    OrderCompanyAddress,
    OrderContact,
    OrderCustomer,
    OrderLine,
    OrderPaymentInfo,
    OrderShippingInfo,
    OrderSummary
} from './order.js';

// Schema imports
import {
    orderAddressSchema,
    orderBillingInfoSchema,
    orderCompanyAddressSchema,
    orderContactSchema,
    orderCustomerSchema,
    orderLineSchema,
    orderPaymentInfoSchema,
    orderSchema,
    orderShippingInfoSchema,
    orderSummarySchema
} from './order.js';

// External imports
import { mapToPrice } from '../../../common/types/price-mappers.js';
import {
    OrderBillingInfoDto,
    OrderCustomerInfoDto,
    OrderDto,
    OrderLineDto,
    OrderPaymentInfoDto,
    OrderShippingInfoDto
} from '../../../infrastructure/umbraco-commerce/index.js';
import { z } from "zod";
import { priceSchema } from "../../../common/types/price.js";

// =============================================================================
// BASIC/PRIMITIVE MAPPERS (Foundation Level)
// =============================================================================

/**
 * Maps contact information from DTO to domain model
 * Foundation mapper with no dependencies
 */
function mapToContact(dto: OrderCustomerInfoDto): OrderContact {
    return orderContactSchema.parse({
        firstName: dto.firstName || null,
        lastName: dto.lastName || null,
        email: dto.email || null,
    });
}

/**
 * Maps address information from DTO to domain model
 * Foundation mapper with no dependencies
 */
function mapToAddress(dto: OrderBillingInfoDto | OrderShippingInfoDto): OrderAddress {
    return orderAddressSchema.parse({
        addressLine1: dto.addressLine1,
        addressLine2: dto.addressLine2,
        city: dto.city,
        zipCode: dto.zipCode,
        countryIsoCode: dto.country?.code || null,
    });
}

// =============================================================================
// COMPOSITE MAPPERS (Building on Foundation)
// =============================================================================

/**
 * Maps company address information (extends basic address)
 * Depends on: mapToAddress
 */
function mapToCompanyAddress(dto: OrderBillingInfoDto | OrderShippingInfoDto): OrderCompanyAddress {
    return orderCompanyAddressSchema.parse({
        ...mapToAddress(dto),
        companyName: dto.companyName || null,
        companyTaxCode: dto.companyTaxCode || null,
    });
}

/**
 * Maps customer information from DTO to domain model
 * Depends on: mapToContact
 */
function mapToOrderCustomer(dto: OrderCustomerInfoDto): OrderCustomer {
    return orderCustomerSchema.parse({
        ...mapToContact(dto),
        customerReference: dto.customerReference || null,
    });
}

// =============================================================================
// COMPLEX DOMAIN MAPPERS (Business Logic Level)
// =============================================================================

/**
 * Maps order billing information
 * Depends on: mapToCompanyAddress, mapToContact
 */
function mapToOrderBillingInfo(dto: OrderBillingInfoDto): OrderBillingInfo {
    return orderBillingInfoSchema.parse({
        ...mapToCompanyAddress(dto),
        contact: mapToContact(dto.contact || {}),
    });
}

/**
 * Maps order shipping information
 * Depends on: mapToCompanyAddress, mapToContact
 */
function mapToOrderShippingInfo(dto: OrderShippingInfoDto): OrderShippingInfo {
    return orderShippingInfoSchema.parse({
        ...mapToCompanyAddress(dto),
        sameAsBilling: dto.sameAsBilling || false,
        contact: mapToContact(dto.contact || {}),
        shippingMethod: dto.shippingMethod?.alias || null,
        shippingOption: dto.shippingOption?.name || null,
        totalPrice: mapToPrice(dto.totalPrice!.value!),
    });
}

/**
 * Maps order payment information
 * No dependencies on other mappers
 */
function mapToOrderPaymentInfo(dto: OrderPaymentInfoDto): OrderPaymentInfo {
    return orderPaymentInfoSchema.parse({
        paymentMethod: dto.paymentMethod?.alias || null,
        totalPrice: mapToPrice(dto.totalPrice!.value!),
    });
}

/**
 * Maps an individual order line from DTO to domain model
 * No dependencies on other mappers
 */
function mapToOrderLine(dto: OrderLineDto): OrderLine {
    return orderLineSchema.parse({
        id: dto.id!,
        productReference: dto.productReference || null,
        productVariantReference: dto.productVariantReference || null,
        bundleId: dto.bundleId || null,
        sku: dto.sku!,
        name: dto.name!,
        basePrice: mapToPrice(dto.basePrice!.value!),
        unitPrice: mapToPrice(dto.unitPrice!.value!),
        quantity: dto.quantity || 1,
        totalPrice: mapToPrice(dto.totalPrice!.value!),
        attributes: dto.attributes?.reduce((acc: Record<string, string>, attr) => {
            acc[attr.name!.name!] = attr.value!.name!;
            return acc;
        }, {}) || {},
        properties: dto.properties || {},
    });
}

// =============================================================================
// PUBLIC API FUNCTIONS (Top Level)
// =============================================================================

/**
 * Maps an OrderDto from the API to an OrderSummary for tool responses
 * Depends on: mapToOrderCustomer
 */
export function mapToOrderSummary(dto: OrderDto): OrderSummary {
    return orderSummarySchema.parse({
        id: dto.id!,
        orderNumber: dto.orderNumber || 'N/A',
        customer: mapToOrderCustomer(dto.customer!),
        totalPrice: mapToPrice(dto.totalPrice!.value!),
        finalizedDate: dto.finalizedDate!,
        totalOrderLines: dto.orderLines?.length || 0,
    });
}

/**
 * Maps an OrderDto to a full Order object including all related data
 * Depends on: mapToOrderSummary, mapToOrderBillingInfo, mapToOrderShippingInfo, mapToOrderPaymentInfo, mapToOrderLine
 */
export function mapToOrder(dto: OrderDto): Order {
    return orderSchema.parse({
        ...mapToOrderSummary(dto),
        status: dto.orderStatus?.alias || 'unknown',
        billing: mapToOrderBillingInfo(dto.billing!),
        shipping: mapToOrderShippingInfo(dto.shipping!),
        payment: mapToOrderPaymentInfo(dto.payment!),
        orderLines: dto.orderLines?.map(mapToOrderLine) || [],
        discountCodes: dto.discountCodes?.map(appliedDiscountCode => appliedDiscountCode.code) || [],
        tags: dto.tags || [],
        properties: dto.properties || {},
    });
}