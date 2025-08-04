# Umbraco Commerce MCP Use Cases

From a store owner perspective, here are the essential capabilities needed for day-to-day operations and business management, along with their implementation status in the MCP server.

## Daily Operations Dashboard

### Today's Key Metrics
- **Use Case**: Morning routine check - "What happened overnight? Any urgent issues?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_store_stats` tool
- **Details**: Provides today's sales, orders, revenue, and key performance indicators

### Orders Needing Attention  
- **Use Case**: Priority management - "What orders need my immediate attention?"
- **Implementation**: ✅ **IMPLEMENTED** - `search_orders` tool with order status filtering
- **Details**: Filter by specific order statuses to find problematic orders, use `get_order_statuses` to see available statuses

### Low Stock Alerts
- **Use Case**: Inventory monitoring - "What products are running low and need restocking?"
- **Implementation**: 📋 **PLANNED** - Proposed `get_low_stock_products_analytics` tool
- **Details**: See [Low Stock Product Analytics specification](technical-specs/low-stock-product-analytics.md)

### Failed Payment Follow-up
- **Use Case**: Payment issue resolution - "What payments failed and need follow-up?"
- **Implementation**: ✅ **IMPLEMENTED** - `search_orders` tool with payment status filtering
- **Details**: Filter by payment statuses like "Errored" to identify payment issues

## Inventory Management

### Products Below Reorder Threshold
- **Use Case**: Restocking decisions - "What do I need to reorder this week?"
- **Implementation**: 📋 **PLANNED** - Proposed `get_low_stock_products_analytics` tool
- **Details**: See [Low Stock Product Analytics specification](technical-specs/low-stock-product-analytics.md)

### Stock Level Updates
- **Use Case**: Stock takes - "Update inventory counts after physical count"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require Commerce API stock update endpoints
- **Details**: Current Commerce Management API is read-only for stock levels

### Inventory Valuation
- **Use Case**: Cash flow planning - "How much money is tied up in inventory?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require custom analytics endpoint
- **Details**: No current Commerce API endpoint for inventory valuation calculations

## Sales & Revenue Analysis

### Sales Performance Summary
- **Use Case**: Business performance - "How did last month compare to the same month last year?"
- **Implementation**: ✅ **PARTIALLY IMPLEMENTED** - Multiple analytics tools
- **Details**: `get_total_revenue_analytics`, `get_total_orders_analytics`, `get_average_order_value_analytics` provide core metrics

### Product Performance Analysis
- **Use Case**: Product decisions - "Which products should I discontinue or promote more?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_top_selling_products_analytics` tool
- **Details**: Identifies best-performing products by sales volume and revenue

### Product Quality & Return Analysis
- **Use Case**: Quality control - "Which products have the highest return rates and should I investigate quality issues?"
- **Implementation**: 📋 **PLANNED** - Would require new product return analytics API
- **Details**: Critical for identifying quality problems, supplier issues, and customer satisfaction trends (see [Product Return Rate Analytics specification](technical-specs/product-return-rate-analytics.md))

### Customer Conversion Analysis
- **Use Case**: Marketing effectiveness - "How well are we converting visitors to customers?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_cart_conversion_rates_analytics` tool
- **Details**: Provides cart and checkout conversion metrics

### Customer Retention Analysis
- **Use Case**: Customer insights - "How many customers are returning to buy again?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_repeat_customer_rates_analytics` tool
- **Details**: Tracks customer retention and repeat purchase behavior

### Abandoned Cart Recovery
- **Use Case**: Revenue recovery - "Who abandoned their cart and might complete their purchase?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_abandoned_cart_conversion_rates_analytics` tool
- **Details**: Identifies abandoned cart recovery opportunities

## Order & Customer Management

### Order Issue Identification
- **Use Case**: Customer service - "Any shipping problems or customer complaints?"
- **Implementation**: ✅ **IMPLEMENTED** - `search_orders` tool with status filtering
- **Details**: Filter by problematic order statuses to identify orders needing attention

### Order Documentation
- **Use Case**: Internal communication - "Add notes about this customer's special requirements"
- **Implementation**: ✅ **IMPLEMENTED** - `add_order_note_tool`
- **Details**: Add internal notes to orders for team communication

### Order Tagging
- **Use Case**: Order categorization - "Tag this order as 'rush delivery'"
- **Implementation**: ✅ **IMPLEMENTED** - `add_order_tags_tool`
- **Details**: Add tags to orders for better organization and filtering

### Payment Management
- **Use Case**: Payment processing - "Capture this authorized payment" or "Process this refund"
- **Implementation**: ✅ **IMPLEMENTED** - Payment management tools
- **Details**: `capture_order_payment_tool`, `cancel_order_payment_tool`, `refund_order_payment_tool`

### Order Retrieval
- **Use Case**: Order details - "Show me all details for order #12345"
- **Implementation**: ✅ **IMPLEMENTED** - `get_order` tool
- **Details**: Retrieve complete order information including customer, items, payments

### Customer Segmentation
- **Use Case**: Relationship building - "Who are my VIP customers?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require customer analytics endpoints
- **Details**: No current Commerce API for customer segmentation or lifetime value

## Cart & Customer Service Management

### Cart Creation for Customers
- **Use Case**: Customer service - "Create a cart for this customer and send them a payment link"
- **Implementation**: 🔧 **API AVAILABLE** - Cart creation and payment link APIs exist, MCP tools not yet implemented
- **Details**: Useful for phone orders, custom quotes, or helping customers who have technical difficulties

### Abandoned Cart Review
- **Use Case**: Customer assistance - "A customer says they can't complete checkout - show me their cart"
- **Implementation**: 🔧 **API AVAILABLE** - Cart retrieval and customer identification APIs exist, MCP tools not yet implemented
- **Details**: Critical for resolving customer checkout issues and recovering abandoned sales

### Cart Recovery and Assistance
- **Use Case**: Proactive customer service - "Send payment links to customers who abandoned carts yesterday"
- **Implementation**: 🔧 **PARTIALLY AVAILABLE** - Cart retrieval APIs exist, but would need cart search and customer contact capabilities
- **Details**: Combines cart analytics with direct customer outreach for sales recovery

### Custom Order Creation
- **Use Case**: Manual order processing - "Create an order for this customer with these specific products and pricing"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require order creation APIs with custom pricing
- **Details**: Essential for B2B scenarios, custom quotes, phone orders, and special pricing arrangements

### Cart Transfer and Sharing
- **Use Case**: Multi-device shopping - "Transfer this customer's cart from mobile to desktop" or "Share this cart with another family member"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require cart sharing and transfer mechanisms
- **Details**: Improves customer experience across devices and supports collaborative shopping

### Order Modification Assistance
- **Use Case**: Customer service - "This customer wants to add an item to their order before shipping"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require order modification APIs
- **Details**: Common customer service scenario requiring order updates before fulfillment

### Gift Card Creation and Delivery
- **Use Case**: Customer service & sales - "Create a $50 gift card for Sarah's birthday and email it to her"
- **Implementation**: 🔧 **API AVAILABLE** - Gift card creation and email APIs exist, MCP tools not yet implemented
- **Details**: Useful for customer service recovery, promotional campaigns, and direct gift card sales

## Customer Service & Management

### Customer Order History
- **Use Case**: Customer service - "Show me all orders for customer john@example.com to understand their purchase history"
- **Implementation**: 🔧 **API AVAILABLE** - Customer order lookup APIs exist, MCP tools not yet implemented
- **Details**: Essential for personalized customer service, issue resolution, and relationship building

### Customer Profile Management
- **Use Case**: Account management - "What's this customer's total lifetime value and order patterns?"
- **Implementation**: 🔧 **PARTIALLY AVAILABLE** - Can retrieve order history, but lifetime value calculations need implementation
- **Details**: Combines order history with calculated metrics for complete customer insights

## Financial Management

### Revenue Analysis
- **Use Case**: Financial planning - "What are my quarterly sales figures?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_total_revenue_analytics` tool
- **Details**: Provides revenue totals with date range filtering for tax and financial reporting

### Cash Flow Analysis
- **Use Case**: Cash flow planning - "Do I have enough cash to make that big purchase?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Beyond Commerce scope
- **Details**: Would require integration with accounting systems

### Product Profitability
- **Use Case**: Profitability analysis - "Which products make me the most money?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require cost data integration
- **Details**: Commerce tracks revenue but not product costs or profit margins

### Tax Reporting
- **Use Case**: Tax preparation - "Show me all taxable transactions for this period"
- **Implementation**: ⚠️ **PARTIALLY AVAILABLE** - Through order search
- **Details**: Can search orders by date range, but dedicated tax reporting endpoints not available

### Payment Reconciliation
- **Use Case**: Accounting reconciliation - "Match these payment gateway transactions with orders"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require payment provider integration
- **Details**: Commerce stores payment references but reconciliation requires external payment data

## Marketing & Growth

### Discount Management
- **Use Case**: Promotion planning - "Create a 20% off sale for September"
- **Implementation**: 📋 **PLANNED** - Natural language discount creation
- **Details**: `get_discounts_tool`, `get_discount_tool` for retrieval implemented, but `create_discount_tool` requires natural language parsing (see [Natural Language Discount Creation specification](technical-specs/natural-language-discount-creation.md))

### Promotion Effectiveness
- **Use Case**: Campaign analysis - "Did that last sale actually increase profits?"
- **Implementation**: ⚠️ **LIMITED** - Through discount usage in order search
- **Details**: Can search orders by discount codes, but no dedicated promotion analytics

### Abandoned Cart Recovery
- **Use Case**: Recovery opportunities - "Who can I follow up with to complete their purchase?"
- **Implementation**: ✅ **IMPLEMENTED** - `get_abandoned_cart_conversion_rates_analytics` tool
- **Details**: Provides abandoned cart metrics for recovery campaign planning

### Customer Acquisition Analysis
- **Use Case**: Marketing ROI - "How are people finding my store?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Beyond Commerce scope
- **Details**: Would require integration with web analytics and marketing platforms

### Email Marketing Performance
- **Use Case**: Email campaign effectiveness - "Which email campaigns drove the most sales?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Beyond Commerce scope
- **Details**: Would require integration with email marketing platforms

## Operational Efficiency

### Order Processing Performance
- **Use Case**: Process improvement - "How quickly are we processing orders?"
- **Implementation**: ⚠️ **LIMITED** - Through order status transitions
- **Details**: Can analyze order status change timing through order search, but no dedicated performance metrics

### Shipping Performance Analysis
- **Use Case**: Shipping optimization - "Are my shipping costs reasonable?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Would require shipping provider integration
- **Details**: Commerce stores shipping selections but not performance or cost analysis

### Team Productivity Metrics
- **Use Case**: Team management - "How can I help my team be more productive?"
- **Implementation**: ❌ **NOT IMPLEMENTED** - Beyond Commerce scope
- **Details**: Would require time tracking and productivity measurement systems

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
