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
function mapToContact(contact: OrderCustomerInfoDto): OrderContact {
    return orderContactSchema.parse({
        firstName: contact.firstName || null,
        lastName: contact.lastName || null,
        email: contact.email || null,
    });
}

/**
 * Maps address information from DTO to domain model
 * Foundation mapper with no dependencies
 */
function mapToAddress(addressable: OrderBillingInfoDto | OrderShippingInfoDto): OrderAddress {
    return orderAddressSchema.parse({
        addressLine1: addressable.addressLine1,
        addressLine2: addressable.addressLine2,
        city: addressable.city,
        zipCode: addressable.zipCode,
        countryIsoCode: addressable.country?.code || null,
    });
}

// =============================================================================
// COMPOSITE MAPPERS (Building on Foundation)
// =============================================================================

/**
 * Maps company address information (extends basic address)
 * Depends on: mapToAddress
 */
function mapToCompanyAddress(addressable: OrderBillingInfoDto | OrderShippingInfoDto): OrderCompanyAddress {
    return orderCompanyAddressSchema.parse({
        ...mapToAddress(addressable),
        companyName: addressable.companyName || null,
        companyTaxCode: addressable.companyTaxCode || null,
    });
}

/**
 * Maps customer information from DTO to domain model
 * Depends on: mapToContact
 */
function mapToOrderCustomer(customer: OrderCustomerInfoDto): OrderCustomer {
    return orderCustomerSchema.parse({
        ...mapToContact(customer),
        customerReference: customer.customerReference || null,
    });
}

// =============================================================================
// COMPLEX DOMAIN MAPPERS (Business Logic Level)
// =============================================================================

/**
 * Maps order billing information
 * Depends on: mapToCompanyAddress, mapToContact
 */
function mapToOrderBillingInfo(billing: OrderBillingInfoDto): OrderBillingInfo {
    return orderBillingInfoSchema.parse({
        ...mapToCompanyAddress(billing),
        contact: mapToContact(billing.contact || {}),
    });
}

/**
 * Maps order shipping information
 * Depends on: mapToCompanyAddress, mapToContact
 */
function mapToOrderShippingInfo(shipping: OrderShippingInfoDto): OrderShippingInfo {
    return orderShippingInfoSchema.parse({
        ...mapToCompanyAddress(shipping),
        sameAsBilling: shipping.sameAsBilling || false,
        contact: mapToContact(shipping.contact || {}),
        shippingMethod: shipping.shippingMethod?.alias || null,
        shippingOption: shipping.shippingOption?.name || null,
        totalPrice: mapToPrice(shipping.totalPrice!.value!),
    });
}

/**
 * Maps order payment information
 * No dependencies on other mappers
 */
function mapToOrderPaymentInfo(payment: OrderPaymentInfoDto): OrderPaymentInfo {
    return orderPaymentInfoSchema.parse({
        paymentMethod: payment.paymentMethod?.alias || null,
        totalPrice: mapToPrice(payment.totalPrice!.value!),
    });
}

/**
 * Maps an individual order line from DTO to domain model
 * No dependencies on other mappers
 */
function mapToOrderLine(orderLine: OrderLineDto): OrderLine {
    return orderLineSchema.parse({
        id: orderLine.id!,
        productReference: orderLine.productReference || null,
        productVariantReference: orderLine.productVariantReference || null,
        bundleId: orderLine.bundleId || null,
        sku: orderLine.sku!,
        name: orderLine.name!,
        basePrice: mapToPrice(orderLine.basePrice!.value!),
        unitPrice: mapToPrice(orderLine.unitPrice!.value!),
        quantity: orderLine.quantity || 1,
        totalPrice: mapToPrice(orderLine.totalPrice!.value!),
        attributes: orderLine.attributes?.reduce((acc: Record<string, string>, attr) => {
            acc[attr.name!.name!] = attr.value!.name!;
            return acc;
        }, {}) || {},
        properties: orderLine.properties || {},
    });
}

// =============================================================================
// PUBLIC API FUNCTIONS (Top Level)
// =============================================================================

/**
 * Maps an OrderDto from the API to an OrderSummary for tool responses
 * Depends on: mapToOrderCustomer
 */
export function mapToOrderSummary(order: OrderDto): OrderSummary {
    return orderSummarySchema.parse({
        id: order.id!,
        orderNumber: order.orderNumber || 'N/A',
        customer: mapToOrderCustomer(order.customer!),
        totalPrice: mapToPrice(order.totalPrice!.value!),
        finalizedDate: order.finalizedDate!,
        totalOrderLines: order.orderLines?.length || 0,
    });
}

/**
 * Maps an OrderDto to a full Order object including all related data
 * Depends on: mapToOrderSummary, mapToOrderBillingInfo, mapToOrderShippingInfo, mapToOrderPaymentInfo, mapToOrderLine
 */
export function mapToOrder(order: OrderDto): Order {
    return orderSchema.parse({
        ...mapToOrderSummary(order),
        status: order.orderStatus?.alias || 'unknown',
        billing: mapToOrderBillingInfo(order.billing!),
        shipping: mapToOrderShippingInfo(order.shipping!),
        payment: mapToOrderPaymentInfo(order.payment!),
        orderLines: order.orderLines?.map(mapToOrderLine) || [],
        discountCodes: order.discountCodes?.map(appliedDiscountCode => appliedDiscountCode.code) || [],
        tags: order.tags || [],
        properties: order.properties || {},
    });
}