# Low Stock Product Analytics

This document details a proposed API enhancement to provide efficient low stock product identification for Umbraco Commerce, enabling better inventory management and AI-driven insights.

## Current Problem

Umbraco Commerce has a bulk stock endpoint that can fetch stock levels for multiple products, but it requires knowing the specific product references you want to check. This creates a chicken-and-egg problem for inventory management - you need to know which products to check before you can identify low stock items.

### Current Bulk Stock Endpoint

**Existing Endpoint:**
```http
GET /umbraco/commerce/management/api/v1/products/stock
```

**Usage Examples:**
```http
# Single product with no variant
GET /umbraco/commerce/management/api/v1/products/stock?productReferences=a19cb2da-a5b5-43cb-b965-7cb38f017d06

# Product with specific variant
GET /umbraco/commerce/management/api/v1/products/stock?productReferences=a19cb2da-a5b5-43cb-b965-7cb38f017d06:fa436107-0f64-40c7-9acb-e4d209bd0094

# Multiple products/variants
GET /umbraco/commerce/management/api/v1/products/stock?productReferences=product1Ref:product1VariantRef&productReferences=product2Ref:product2VariantRef
```

### Current Limitations

**Knowledge Requirement Problem:**
- Must already know which product references to check
- No way to discover products below a stock threshold
- Requires separate product catalog query followed by stock check
- Inefficient two-step process for inventory management

**Typical Current Workflow:**
1. Fetch all products from catalog endpoint
2. Extract product references (GUIDs) from hundreds/thousands of products  
3. Build bulk stock query with all product references
4. **Handle URL length limitations** - batch requests due to GUID length in query strings
5. Parse multiple response batches to identify which products are below threshold
6. Cross-reference stock data with product details

**Additional Complexity - URL Length Limitations:**
Since product references are GUIDs (36 characters each), requesting stock for many products quickly exceeds maximum URL length:

```http
# Single product reference: ~36 characters
productReferences=a19cb2da-a5b5-43cb-b965-7cb38f017d06

# With variant: ~73 characters  
productReferences=a19cb2da-a5b5-43cb-b965-7cb38f017d06:fa436107-0f64-40c7-9acb-e4d209bd0094

# 100 products = ~3,600+ characters in URL (approaching/exceeding limits)
# 1000 products = ~36,000+ characters (definitely exceeds URL limits)
```

This forces **batched requests**, making the process even more complex:
- Split product list into chunks of ~20-50 products per request
- Make multiple API calls and aggregate results
- Handle partial failures and retry logic
- Increased latency due to multiple round trips

### Business Impact

**For Store Operators:**
- Manual inventory monitoring is time-consuming
- Risk of stockouts due to delayed identification
- Difficulty prioritizing restocking efforts
- No proactive inventory management capabilities

**For AI Integration:**
- Cannot provide efficient low stock alerts
- Unable to support automated restocking recommendations
- Limited inventory insights due to data access constraints
- Poor performance when analyzing inventory levels

## Proposed Solution

Add a new analytics endpoint that efficiently returns products below specified stock thresholds, with filtering and sorting capabilities.

### API Endpoint

Following the existing analytics endpoint pattern:

```http
POST /umbraco/commerce/management/api/v1/analytics/low-stock-products
```

### Request Parameters

Following the Orders API pattern with `skip` and `take` for pagination:

```typescript
interface LowStockAnalyticsRequest {
  storeIdOrAlias: string;
  threshold: number;                    // Stock level threshold (products below this level are returned)
  skip?: number;                        // Number of items to skip (for pagination)
  take?: number;                        // Number of results to return (default: 50, max: 200)
}
```

### Request Example

```http
POST /umbraco/commerce/management/api/v1/analytics/low-stock-products
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "threshold": 10,
  "skip": 0,
  "take": 50
}
```

### Response Format

Following the standard Commerce API pagination pattern:

```json
{
  "items": [
    {
      "sku": "BOOK-001",
      "productReference": "12345",
      "productVariantReference": "12345-001", 
      "name": "TypeScript Handbook",
      "stockLevel": 2,
      "lastStockUpdate": "2025-07-15T14:30:00Z",
      "productType": "Books",
      "price": {
        "value": 29.99,
        "currencyId": "GBP"
      }
    },
    {
      "sku": "TSHIRT-RED-L",
      "productReference": "67890", 
      "productVariantReference": "67890-RED-L",
      "name": "Red T-Shirt (Large)",
      "stockLevel": 0,
      "lastStockUpdate": "2025-07-14T09:15:00Z",
      "productType": "Clothing",
      "price": {
        "value": 19.99,
        "currencyId": "GBP"
      }
    }
  ],
  "total": 15
}
```

### Query Examples

**Basic Low Stock Query:**
```http
POST /umbraco/commerce/management/api/v1/analytics/low-stock-products
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "threshold": 10
}
```

**Different Threshold with Pagination:**
```http
POST /umbraco/commerce/management/api/v1/analytics/low-stock-products
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "threshold": 5,
  "skip": 50,
  "take": 100
}
```

## Response Data Fields

### Core Product Information
- **sku**: Product SKU identifier
- **productReference**: Internal product reference number
- **productVariantReference**: Specific variant reference (for products with variants)
- **name**: Display name of the product/variant

### Stock Information  
- **stockLevel**: Current stock quantity
- **lastStockUpdate**: Timestamp of last stock level change

### Additional Context
- **productType**: Product category/type for filtering
- **price**: Current price information for business context

### Pagination Response
- **items**: Array of products below the specified threshold
- **total**: Total number of products below threshold (for pagination calculations)

## Use Cases

### Store Operations
- **Daily Stock Review**: "Show me all products with less than 10 items in stock"
- **Category Monitoring**: "What clothing items are running low?"
- **Restocking Priority**: "Which out-of-stock items should I reorder first?"
- **Inventory Alerts**: Set up automated alerts when products fall below thresholds

### AI Integration
- **Proactive Notifications**: "You have 15 products running low on stock"
- **Restocking Recommendations**: "Based on sales velocity, you should reorder these 5 items"
- **Inventory Insights**: "Electronics category has the most stock issues this month"
- **Automated Workflows**: Trigger purchase orders when stock falls below thresholds

### Business Intelligence
- **Stock Health Dashboard**: Overview of inventory levels across categories
- **Trend Analysis**: Track which products frequently run low
- **Supplier Management**: Group low stock items by supplier for bulk ordering

## Performance Considerations

### Database Optimization
- Index on stock levels for efficient threshold filtering
- Consider materialized views for frequently accessed stock data
- Pagination to handle large product catalogs

### Caching Strategy
- Cache stock level summaries with appropriate TTL
- Invalidate cache on stock level changes
- Consider near-real-time updates for critical stock levels

### Response Size Management
- Limit maximum results per request (suggested 200)
- Provide pagination for large result sets
- Include summary statistics to give context without requiring full enumeration

## MCP Tool Integration

### Simplified Stock Monitoring Tool

Following the pattern of `search-orders-tool.ts` with cursor-based pagination:

```typescript
// src/features/analytics/tools/get-low-stock-products-analytics-tool.ts
import { z } from 'zod';
import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
import { Analytics, LowStockProductDto } from "../../../infrastructure/umbraco-commerce/index.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { paginationRequestSchema, paginator } from "../../../common/types/pagination.js";

const getLowStockProductsRequestSchema = storeIdOrAliasRequestSchema
    .merge(paginationRequestSchema)
    .extend({
        threshold: z.number().min(0).describe('Stock level threshold - products below this level will be returned')
    });

const getLowStockProductsAnalyticsTool = {
    name: 'get_low_stock_products_analytics',
    description: `Retrieve products with stock levels below a specified threshold for inventory management. This tool provides insights into products that may need restocking, helping to prevent stockouts and optimize inventory levels. The store is identified by its unique ID or alias.

Use cursor-based pagination to navigate through results efficiently.`,
    paramsSchema: getLowStockProductsRequestSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        const { storeIdOrAlias, cursor, threshold } = args;

        const { data, nextCursor } = await paginator.paginate<LowStockProductDto>(async (page, pageSize) => {
            const { data } = await Analytics.getLowStockProducts({
                headers: {
                    store: storeIdOrAlias
                },
                query: {
                    threshold,
                    skip: (page - 1) * pageSize,
                    take: pageSize
                }
            });
            return {
                data: data?.items || [],
                total: data?.total || 0
            }
        }, { cursor });
        
        return createJsonResult(data, nextCursor);
    }
} satisfies ToolDefinition<typeof getLowStockProductsRequestSchema.shape>;

export default getLowStockProductsAnalyticsTool;
```

### Key Implementation Details

- **Cursor-Based Pagination**: Uses the same `paginator` utility as search-orders-tool
- **API Pattern**: Follows the pattern where API uses `skip`/`take`, but MCP tool exposes `cursor`
- **Error Handling**: Same pattern as existing analytics tools
- **Response Mapping**: Returns paginated data with nextCursor for continuation

### Usage Examples

**AI Conversation Examples:**
- "Show me products that are running low on stock" → `threshold: 10`
- "What items are completely out of stock?" → `threshold: 1`
- "Give me the top 20 items that need restocking" → `threshold: 10, take: 20`

## Implementation Benefits

### For Store Operators
- **Efficiency**: Single API call instead of complex multi-step workflow with batched requests
- **Proactive Management**: Identify restocking needs before stockouts occur
- **Prioritization**: Sort by stock level to focus on most urgent items
- **Category Insights**: Understand stock patterns across product types

### For AI Integration
- **Performance**: Efficient single-call data retrieval eliminates batching complexity and URL length issues
- **Automation**: Support automated restocking workflows and alerts
- **Intelligence**: Enable sophisticated inventory management recommendations
- **User Experience**: Provide instant stock status insights to users

### For Business Intelligence
- **Dashboard Ready**: Data structured for inventory management dashboards
- **Trend Analysis**: Track stock level patterns over time
- **Operational Metrics**: Measure inventory management effectiveness

## Future Enhancements

### Advanced Filtering
- Filter by supplier/vendor
- Filter by sales velocity (fast-moving vs slow-moving items)
- Filter by profit margin for prioritization
- Date range filtering for stock level changes

### Predictive Analytics
- Estimated days until stockout based on sales velocity
- Recommended reorder quantities
- Seasonal stock level adjustments
- Supplier lead time integration

### Integration Capabilities
- Webhook notifications when products fall below thresholds
- Export capabilities for ERP systems
- Bulk stock update endpoints
- Purchase order generation integration

## Back-Office Integration Opportunity

### Analytics Dashboard Widget

This low stock analytics endpoint could also power a back-office analytics widget, providing store operators with immediate visibility into inventory issues.

**Proposed Widget Features:**
- **At-a-Glance Overview**: Show count of products below configurable threshold
- **Quick Action Items**: Display top 5-10 most critical low stock items
- **Threshold Configuration**: Allow users to set custom stock level alerts
- **Direct Navigation**: Click-through to full product management for restocking
- **Visual Indicators**: Color-coded alerts (yellow for low stock, red for out of stock)

**Widget Layout Example:**
```
┌─────────────────────────────────────┐
│ Low Stock Alert                     │
├─────────────────────────────────────┤
│ 15 products below threshold (10)    │
│                                     │
│ Most Critical:                      │
│ • Red T-Shirt (Large) - 0 left      │
│ • TypeScript Handbook - 2 left      │
│ • Blue Jeans (Medium) - 3 left      │
└─────────────────────────────────────┘
```

**Benefits for Back-Office Users:**
- **Proactive Alerts**: Dashboard visibility prevents stockouts
- **Immediate Action**: Quick identification of restocking priorities
- **Configurable Thresholds**: Adapt to different product types and business needs
- **Integration**: Seamless with existing analytics dashboard

This would complement the AI/MCP integration by providing the same data to human operators through the back-office interface.

## Implementation Priority

**Medium** - This endpoint addresses a clear operational need and would significantly improve inventory management capabilities for both human operators and AI systems. The performance benefits of bulk stock checking make this a valuable addition to the Commerce API.

**Additional Value**: Could also power a back-office analytics widget, providing dual benefits for both API consumers and dashboard users.

## Success Metrics

### Performance Metrics
- **API Response Time**: Target <500ms for typical queries
- **Query Efficiency**: Measure database performance improvements vs individual product queries
- **Cache Hit Rate**: Effectiveness of caching strategy

### Usage Metrics  
- **Adoption Rate**: Percentage of stores using the low stock endpoint
- **Query Patterns**: Most common threshold values and filters used
- **Integration Success**: Number of AI tools and dashboards utilizing the endpoint

### Business Impact
- **Stockout Reduction**: Decrease in out-of-stock incidents
- **Inventory Turnover**: Improvement in inventory management efficiency
- **User Satisfaction**: Feedback on inventory management workflow improvements