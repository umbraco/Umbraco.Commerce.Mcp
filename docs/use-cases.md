# Umbraco Commerce MCP Use Cases

From a store owner perspective, here are the essential capabilities needed for day-to-day operations and business management, along with their implementation status in the MCP server.

## Daily Operations Dashboard

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Morning routine check - "What happened overnight? Any urgent issues?" | ✅ **IMPLEMENTED** | `get_store_stats` | Provides today's sales, orders, revenue, and key performance indicators |
| Priority management - "What orders need my immediate attention?" | ✅ **IMPLEMENTED** | `search_orders` with status filtering | Filter by specific order statuses to find problematic orders |
| Inventory monitoring - "What products are running low and need restocking?" | 📋 **PLANNED** | `get_low_stock_products_analytics` | See [Low Stock Product Analytics](technical-specs/low-stock-product-analytics.md) |
| Payment issue resolution - "What payments failed and need follow-up?" | ✅ **IMPLEMENTED** | `search_orders` with payment status filtering | Filter by payment statuses like "Error" to identify payment issues |

## Inventory Management

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Restocking decisions - "What do I need to reorder this week?" | 📋 **PLANNED** | `get_low_stock_products_analytics` | See [Low Stock Product Analytics](technical-specs/low-stock-product-analytics.md) |
| Stock takes - "Update inventory counts after physical count" | ❌ **NOT IMPLEMENTED** | Stock update endpoints needed | Current Commerce Management API is read-only for stock levels |
| Cash flow planning - "How much money is tied up in inventory?" | ❌ **NOT IMPLEMENTED** | Custom analytics endpoint needed | No current Commerce API endpoint for inventory valuation |

## Sales & Revenue Analysis

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Business performance - "How did last month compare to the same month last year?" | ✅ **PARTIALLY IMPLEMENTED** | Multiple analytics tools | `get_total_revenue_analytics`, `get_total_orders_analytics`, `get_average_order_value_analytics` |
| Product decisions - "Which products should I discontinue or promote more?" | ✅ **IMPLEMENTED** | `get_top_selling_products_analytics` | Identifies best-performing products by sales volume and revenue |
| Quality control - "Which products have the highest return rates?" | 📋 **PLANNED** | Product return analytics API | See [Product Return Rate Analytics](technical-specs/product-return-rate-analytics.md) |
| Marketing effectiveness - "How well are we converting visitors to customers?" | ✅ **IMPLEMENTED** | `get_cart_conversion_rates_analytics` | Provides cart and checkout conversion metrics |
| Customer insights - "How many customers are returning to buy again?" | ✅ **IMPLEMENTED** | `get_repeat_customer_rates_analytics` | Tracks customer retention and repeat purchase behavior |
| Revenue recovery - "Who abandoned their cart and might complete their purchase?" | ✅ **IMPLEMENTED** | `get_abandoned_cart_conversion_rates_analytics` | Identifies abandoned cart recovery opportunities |

## Order & Customer Management

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Customer service - "Any shipping problems or customer complaints?" | ✅ **IMPLEMENTED** | `search_orders` with status filtering | Filter by problematic order statuses to identify orders needing attention |
| Internal communication - "Add notes about this customer's special requirements" | ✅ **IMPLEMENTED** | `add_order_note_tool` | Add internal notes to orders for team communication |
| Order categorization - "Tag this order as 'rush delivery'" | ✅ **IMPLEMENTED** | `add_order_tags_tool` | Add tags to orders for better organization and filtering |
| Payment processing - "Capture this authorized payment" or "Process this refund" | ✅ **IMPLEMENTED** | Payment management tools | `capture_order_payment_tool`, `cancel_order_payment_tool`, `refund_order_payment_tool` |
| Order details - "Show me all details for order #12345" | ✅ **IMPLEMENTED** | `get_order` | Retrieve complete order information including customer, items, payments |
| Relationship building - "Who are my VIP customers?" | ❌ **NOT IMPLEMENTED** | Customer analytics endpoints needed | No current Commerce API for customer segmentation or lifetime value |

## Cart & Customer Service Management

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Customer service - "Create a cart for this customer and send them a payment link" | 🔧 **API AVAILABLE** | Cart creation and payment link APIs | MCP tools not yet implemented; useful for phone orders, custom quotes |
| Customer assistance - "A customer says they can't complete checkout - show me their cart" | 🔧 **API AVAILABLE** | Cart retrieval and customer identification APIs | MCP tools not yet implemented; critical for resolving checkout issues |
| Proactive customer service - "Send payment links to customers who abandoned carts yesterday" | 🔧 **PARTIALLY AVAILABLE** | Cart retrieval APIs + search capabilities needed | Combines cart analytics with direct customer outreach |
| Manual order processing - "Create an order for this customer with these specific products and pricing" | ❌ **NOT IMPLEMENTED** | Order creation APIs with custom pricing | Essential for B2B scenarios, custom quotes, phone orders |
| Multi-device shopping - "Transfer this customer's cart from mobile to desktop" | ❌ **NOT IMPLEMENTED** | Cart sharing and transfer mechanisms | Improves customer experience across devices |
| Customer service - "This customer wants to add an item to their order before shipping" | ❌ **NOT IMPLEMENTED** | Order modification APIs | Common customer service scenario requiring order updates |
| Customer service & sales - "Create a $50 gift card for Sarah's birthday and email it to her" | 🔧 **API AVAILABLE** | Gift card creation and email APIs | MCP tools not yet implemented; useful for service recovery, promotions |

## Customer Service & Management

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Customer service - "Show me all orders for customer john@example.com" | 🔧 **API AVAILABLE** | Customer order lookup APIs | MCP tools not yet implemented; essential for personalized service |
| Account management - "What's this customer's total lifetime value and order patterns?" | 🔧 **PARTIALLY AVAILABLE** | Order history APIs + calculations needed | Can retrieve order history, but lifetime value calculations need implementation |

## Financial Management

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Financial planning - "What are my quarterly sales figures?" | ✅ **IMPLEMENTED** | `get_total_revenue_analytics` | Provides revenue totals with date range filtering for tax and financial reporting |
| Cash flow planning - "Do I have enough cash to make that big purchase?" | ❌ **NOT IMPLEMENTED** | Beyond Commerce scope | Would require integration with accounting systems |
| Profitability analysis - "Which products make me the most money?" | ❌ **NOT IMPLEMENTED** | Cost data integration needed | Commerce tracks revenue but not product costs or profit margins |
| Tax preparation - "Show me all taxable transactions for this period" | ⚠️ **PARTIALLY AVAILABLE** | Order search by date range | Can search orders by date range, but no dedicated tax reporting endpoints |
| Accounting reconciliation - "Match these payment gateway transactions with orders" | ❌ **NOT IMPLEMENTED** | Payment provider integration needed | Commerce stores payment references but reconciliation requires external data |

## Marketing & Growth

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Promotion planning - "Create a 20% off sale for September" | 📋 **PLANNED** | Natural language discount creation | `get_discounts_tool`, `get_discount_tool` implemented; creation needs natural language parsing - see [Natural Language Discount Creation](technical-specs/natural-language-discount-creation.md) |
| Campaign analysis - "Did that last sale actually increase profits?" | ⚠️ **LIMITED** | Order search by discount codes | Can search orders by discount codes, but no dedicated promotion analytics |
| Recovery opportunities - "Who can I follow up with to complete their purchase?" | ✅ **IMPLEMENTED** | `get_abandoned_cart_conversion_rates_analytics` | Provides abandoned cart metrics for recovery campaign planning |
| Marketing ROI - "How are people finding my store?" | ❌ **NOT IMPLEMENTED** | Beyond Commerce scope | Would require integration with web analytics and marketing platforms |
| Email campaign effectiveness - "Which email campaigns drove the most sales?" | ❌ **NOT IMPLEMENTED** | Beyond Commerce scope | Would require integration with email marketing platforms |

## Operational Efficiency

| Use Case | Implementation | Tool/API | Details |
|----------|----------------|----------|---------|
| Process improvement - "How quickly are we processing orders?" | ⚠️ **LIMITED** | Order status transitions analysis | Can analyze order status change timing through order search, but no dedicated performance metrics |
| Shipping optimization - "Are my shipping costs reasonable?" | ❌ **NOT IMPLEMENTED** | Shipping provider integration needed | Commerce stores shipping selections but not performance or cost analysis |
| Team management - "How can I help my team be more productive?" | ❌ **NOT IMPLEMENTED** | Beyond Commerce scope | Would require time tracking and productivity measurement systems |

## Implementation Status Summary

### ✅ Fully Implemented 
- **Orders**: Search, retrieve, add notes, add tags, payment management (capture, cancel, refund)
- **Analytics**: Revenue, order volume, average order value, top products, conversion rates, customer retention
- **Discounts**: Retrieve, list discounts (creation requires natural language parsing)
- **Store**: Store statistics and performance metrics
- **Admin**: Order status management

### 📋 Planned (Documented in Technical Specs)
- **Inventory**: Low stock product analytics
- **Filters**: Advanced filter discoverability system
- **Discounts**: Natural language discount creation
- **Product Analytics**: Product return rates and quality analysis

### 🔧 API Available (MCP Tools Not Yet Implemented)
- **Cart Management**: Cart creation, payment links, cart retrieval, customer identification
- **Gift Cards**: Gift card creation and email delivery
- **Customer Management**: Customer order history lookup and profile data

### ❌ Not Implemented (Requires Additional Development)
- **Cart Management**: Order modification, comprehensive cart search
- **Financial**: Cost tracking, profitability analysis, cash flow
- **Marketing**: Campaign performance, customer acquisition analytics
- **Inventory**: Stock level updates, inventory valuation
- **Operations**: Process efficiency, shipping performance
- **Intelligence**: Competitive analysis, market trends, demand forecasting

## Example Store Owner Conversations

### Supported Today
- ✅ "How did yesterday's sales compare to target?" → `get_total_revenue_analytics`
- ✅ "What orders need my immediate attention?" → `search_orders` with status filtering
- ✅ "What are my top selling products?" → `get_top_selling_products_analytics`
- ✅ "Show me order #12345 details" → `get_order`
- ✅ "Add a note to this order about special delivery" → `add_order_note_tool`
- ✅ "What discounts are currently active?" → `get_discounts_tool`

### Coming Soon (Planned)
- 📋 "What products are running low on stock?" → Planned low stock analytics
- 📋 "Create a 20% discount for September" → Planned natural language discount parsing
- 📋 "Create a buy-one-get-one deal" → Planned natural language discount parsing
- 📋 "Which products have the highest return rates?" → Planned product return analytics API

### Coming Soon (API Available, Tools Not Implemented)
- 🔧 "Create a cart for John Doe and send him a payment link" - Cart creation and payment link APIs available
- 🔧 "Show me the cart this customer abandoned yesterday" - Cart retrieval and customer identification APIs available
- 🔧 "Create a $100 gift card for Maria and email it to her" - Gift card creation and email APIs available
- 🔧 "Show me all orders for customer sarah@example.com" - Customer order lookup APIs available

### Future Considerations
- ❌ "Which marketing campaigns performed best?" - Requires marketing platform integration
- ❌ "What customers haven't ordered in a while?" - Requires customer analytics development
- ❌ "How profitable was last month?" - Requires cost data integration

## Key Principles

The current implementation focuses on **actionable Commerce data** that store owners can act on immediately:
- Order management and customer service
- Sales performance and analytics
- Discount and promotion management
- Inventory awareness (planned)

Future expansions would integrate with external systems for comprehensive business intelligence.
