# Product Return Rate Analytics

This document details a proposed API enhancement to provide efficient product return rate analysis for Umbraco Commerce, enabling better quality control, supplier management, and customer satisfaction monitoring.

## Current Problem

Umbraco Commerce currently lacks comprehensive return analytics and reason tracking. While the system can handle partial refunds and track which order lines are refunded, it has significant gaps:

### Current Capabilities
- **Partial Refunds**: Can process refunds for specific order lines
- **Financial Tracking**: Tracks refund amounts and order line associations
- **Refund Processing**: Handles the transactional aspects of returns

### Missing Capabilities  
- **Return Reason Capture**: No mechanism to record why products are being returned
- **Return Analytics**: Cannot identify which products have high return rates
- **Quality Insights**: No visibility into patterns indicating quality issues
- **Trend Analysis**: Cannot track if return rates are improving or worsening over time
- **Supplier Quality Tracking**: No way to correlate returns with suppliers or product sources

### Business Impact

**For Store Operators:**
- Cannot proactively identify quality issues before they affect more customers
- Missing data for supplier negotiations and quality discussions
- Unable to optimize product mix based on return patterns
- No early warning system for product quality problems
- Difficult to measure the true profitability of products (sales minus return costs)

**For Customer Satisfaction:**
- Quality issues aren't identified until multiple customers are affected
- No systematic approach to product improvement based on return feedback
- Cannot prioritize which products need quality attention first

## Proposed Solution

This enhancement requires two complementary improvements:

### 1. Enhanced Return Process (Prerequisite)
**Extend the existing refund process to capture return reasons:**
- Add optional `returnReason` field to refund/return APIs
- Support both predefined reasons (dropdown) and custom text
- Associate return reasons with specific order lines being refunded
- Store return reason data for analytics and reporting

### 2. Return Analytics API (Main Feature)
**Add a new analytics endpoint** that provides comprehensive return rate analysis with filtering, sorting, and time period capabilities, leveraging the enhanced return reason data.

### API Endpoint

Following the existing analytics endpoint pattern:

```http
POST /umbraco/commerce/management/api/v1/analytics/product-return-rates
```

### Request Parameters

Following the Orders API pattern with `skip` and `take` for pagination:

```typescript
interface ProductReturnRateAnalyticsRequest {
  storeIdOrAlias: string;
  dateFrom?: string;                    // ISO date string (default: 30 days ago)
  dateTo?: string;                      // ISO date string (default: today)
  minReturnRate?: number;               // Minimum return rate percentage (0-100, default: 0)
  sortBy?: 'returnRate' | 'returnCount' | 'productName' | 'totalSold';  // Sort field
  sortDirection?: 'asc' | 'desc';       // Sort direction (default: desc)
  skip?: number;                        // Number of items to skip (for pagination)
  take?: number;                        // Number of results to return (default: 50, max: 200)
}
```

### Request Example

```http
POST /umbraco/commerce/management/api/v1/analytics/product-return-rates
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "dateFrom": "2025-01-01T00:00:00Z",
  "dateTo": "2025-07-31T23:59:59Z",
  "minReturnRate": 5.0,
  "sortBy": "returnRate",
  "sortDirection": "desc",
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
      "sku": "HEADPHONES-XYZ",
      "productReference": "12345",
      "productVariantReference": "12345-001",
      "name": "Wireless Headphones XYZ",
      "productType": "Electronics",
      "totalSold": 250,
      "totalReturned": 23,
      "returnRate": 9.2,
      "returnReasons": [
        {
          "reason": "Defective",
          "count": 15,
          "percentage": 65.2
        },
        {
          "reason": "Not as described",
          "count": 5,
          "percentage": 21.7
        },
        {
          "reason": "Changed mind",
          "count": 3,
          "percentage": 13.1
        }
      ],
      "returnValue": {
        "value": 2760.00,
        "currencyId": "GBP"
      },
      "averageReturnTime": 12,
      "firstReturnDate": "2025-02-15T10:30:00Z",
      "lastReturnDate": "2025-07-20T14:45:00Z",
      "trend": {
        "direction": "increasing",
        "changePercentage": 15.3
      }
    },
    {
      "sku": "TSHIRT-BLUE-M",
      "productReference": "67890",
      "productVariantReference": "67890-BLUE-M",
      "name": "Blue T-Shirt (Medium)",
      "productType": "Clothing",
      "totalSold": 180,
      "totalReturned": 14,
      "returnRate": 7.8,
      "returnReasons": [
        {
          "reason": "Wrong size",
          "count": 9,
          "percentage": 64.3
        },
        {
          "reason": "Color not as expected",
          "count": 3,
          "percentage": 21.4
        },
        {
          "reason": "Quality issues",
          "count": 2,
          "percentage": 14.3
        }
      ],
      "returnValue": {
        "value": 279.72,
        "currencyId": "GBP"
      },
      "averageReturnTime": 8,
      "firstReturnDate": "2025-03-01T09:15:00Z",
      "lastReturnDate": "2025-07-18T16:20:00Z",
      "trend": {
        "direction": "stable",
        "changePercentage": -2.1
      }
    }
  ],
  "total": 15,
  "summary": {
    "totalProductsAnalyzed": 1247,
    "totalItemsSold": 18650,
    "totalItemsReturned": 892,
    "overallReturnRate": 4.8,
    "totalReturnValue": {
      "value": 45230.50,
      "currencyId": "GBP"
    },
    "averageReturnTime": 10
  }
}
```

### Query Examples

**High Return Rate Products:**
```http
POST /umbraco/commerce/management/api/v1/analytics/product-return-rates
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "minReturnRate": 10.0,
  "sortBy": "returnRate",
  "sortDirection": "desc"
}
```

**Recent Return Trends (Last 30 Days):**
```http
POST /umbraco/commerce/management/api/v1/analytics/product-return-rates
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "dateFrom": "2025-07-01T00:00:00Z",
  "dateTo": "2025-07-31T23:59:59Z",
  "sortBy": "returnCount",
  "take": 20
}
```

**Most Returned Products by Volume:**
```http
POST /umbraco/commerce/management/api/v1/analytics/product-return-rates
Content-Type: application/json
Store: default

{
  "storeIdOrAlias": "default",
  "sortBy": "returnCount",
  "sortDirection": "desc",
  "take": 25
}
```

## Response Data Fields

### Core Product Information
- **sku**: Product SKU identifier
- **productReference**: Internal product reference number
- **productVariantReference**: Specific variant reference (for products with variants)
- **name**: Display name of the product/variant
- **productType**: Product category for grouping and analysis

### Return Analytics
- **totalSold**: Number of units sold in the specified period
- **totalReturned**: Number of units returned in the specified period
- **returnRate**: Percentage return rate (totalReturned / totalSold * 100)
- **returnValue**: Total monetary value of returned items
- **averageReturnTime**: Average days between purchase and return

### Return Reason Analysis
- **returnReasons**: Array of return reasons with counts and percentages
  - Common reasons: "Defective", "Wrong size", "Not as described", "Changed mind", "Quality issues"
  - Enables targeted quality improvements and customer education

### Trend Information
- **firstReturnDate**: Date of first return in the period
- **lastReturnDate**: Date of most recent return
- **trend**: Direction and percentage change compared to previous period

### Summary Statistics
- **totalProductsAnalyzed**: Number of products included in analysis
- **overallReturnRate**: Store-wide return rate for comparison
- **totalReturnValue**: Total financial impact of returns
- **averageReturnTime**: Average time customers take to return items

## Use Cases

### Quality Control
- **Product Quality Issues**: "Show me products with return rates above 10%"
- **Defect Identification**: "Which products are returned most for quality issues?"
- **Supplier Performance**: "How do products from Supplier A compare to Supplier B for returns?"
- **Quality Trends**: "Are return rates improving after our quality initiatives?"

### Business Operations
- **Financial Impact**: "What's the cost of returns by product category?"
- **Inventory Planning**: "Should I discontinue products with high return rates?"
- **Customer Satisfaction**: "Which products cause the most customer dissatisfaction?"
- **Process Improvement**: "Are customers returning items faster or slower than before?"

### Strategic Decision Making
- **Product Mix Optimization**: "Which products should I promote vs. phase out?"
- **Supplier Negotiations**: "What data do I need for quality discussions with suppliers?"
- **Customer Experience**: "How can I reduce returns through better product descriptions?"
- **Profitability Analysis**: "What's the true profit after accounting for return costs?"

## Performance Considerations

### Database Optimization
- Index on return dates and product references for efficient filtering
- Consider materialized views for frequently accessed return rate calculations
- Pagination to handle large product catalogs efficiently

### Caching Strategy
- Cache return rate calculations with appropriate TTL (e.g., 1 hour)
- Invalidate cache when new returns are processed
- Consider pre-calculating common time periods (30 days, 90 days, 1 year)

### Response Size Management
- Limit maximum results per request (suggested 200)
- Provide pagination for large result sets
- Include summary statistics to give context without requiring full enumeration

## MCP Tool Integration

### Return Rate Analysis Tool

Following the pattern of existing analytics tools with cursor-based pagination:

```typescript
// src/features/analytics/tools/get-product-return-rates-analytics-tool.ts
import { z } from 'zod';
import { ToolDefinition } from '../../../common/mcp/tools/tool-definition.js';
import { Session } from '../../../common/session/types/session.js';
import { createJsonResult } from '../../../common/mcp/tools/tool-result-helpers.js';
import { Analytics, ProductReturnRateDto } from "../../../infrastructure/umbraco-commerce/index.js";
import { storeIdOrAliasRequestSchema } from "../../../common/types/store.js";
import { paginationRequestSchema, paginator } from "../../../common/types/pagination.js";

const getProductReturnRatesRequestSchema = storeIdOrAliasRequestSchema
    .merge(paginationRequestSchema)
    .extend({
        dateFrom: z.string().optional().describe('Start date for analysis period (ISO format, e.g., 2025-01-01T00:00:00Z)'),
        dateTo: z.string().optional().describe('End date for analysis period (ISO format, e.g., 2025-07-31T23:59:59Z)'),
        minReturnRate: z.number().min(0).max(100).optional().describe('Minimum return rate percentage (0-100) to include products'),
        sortBy: z.enum(['returnRate', 'returnCount', 'productName', 'totalSold']).optional().describe('Field to sort results by'),
        sortDirection: z.enum(['asc', 'desc']).optional().describe('Sort direction (ascending or descending)')
    });

const getProductReturnRatesAnalyticsTool = {
    name: 'get_product_return_rates_analytics',
    description: `Retrieve products with their return rates and return reason analysis for quality control and business optimization. This tool helps identify products with quality issues, track supplier performance, and understand customer satisfaction patterns.
    
Use this tool to:
- Identify products with high return rates that may have quality issues
- Analyze return reasons to understand why customers return specific products
- Track return trends over time to measure quality improvements
- Calculate the financial impact of returns by product
- Make data-driven decisions about product mix and supplier relationships

The store is identified by its unique ID or alias. Use cursor-based pagination to navigate through results efficiently.`,
    paramsSchema: getProductReturnRatesRequestSchema.shape,
    
    canAccess: (session: Session) => session.hasAccessToSection('commerce'),
    
    execute: async (args, context) => {
        const { storeIdOrAlias, cursor, dateFrom, dateTo, minReturnRate, sortBy, sortDirection } = args;

        const { data, nextCursor } = await paginator.paginate<ProductReturnRateDto>(async (page, pageSize) => {
            const { data } = await Analytics.getProductReturnRates({
                headers: {
                    store: storeIdOrAlias
                },
                query: {
                    dateFrom,
                    dateTo,
                    minReturnRate,
                    sortBy,
                    sortDirection,
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
} satisfies ToolDefinition<typeof getProductReturnRatesRequestSchema.shape>;

export default getProductReturnRatesAnalyticsTool;
```

### Key Implementation Details

- **Cursor-Based Pagination**: Uses the same `paginator` utility as other analytics tools
- **Flexible Filtering**: Supports date ranges, minimum return rate thresholds, and sorting options
- **API Pattern**: Follows the pattern where API uses `skip`/`take`, but MCP tool exposes `cursor`
- **Rich Parameters**: Provides date filtering and sorting options for targeted analysis
- **Response Mapping**: Returns paginated data with nextCursor for continuation

### Usage Examples

**AI Conversation Examples:**
- "Show me products with high return rates" → `minReturnRate: 10`
- "What products were returned most in the last month?" → `dateFrom: "2025-07-01"`, `sortBy: "returnCount"`
- "Which products have the worst quality issues?" → `sortBy: "returnRate"`
- "Show me return trends for electronics" → Filter by product type (if available in future)

## Implementation Benefits

### For Store Operators
- **Proactive Quality Management**: Identify problems before they affect more customers
- **Supplier Accountability**: Data-driven conversations about product quality
- **Financial Visibility**: Understand the true cost of returns
- **Customer Satisfaction**: Reduce returns through targeted improvements

### For AI Integration
- **Intelligent Alerts**: "You have 3 products with return rates above 15%"
- **Quality Recommendations**: "Consider reviewing the supplier for Product X due to high defect returns"
- **Trend Analysis**: "Return rates have increased 20% this month compared to last month"
- **Cost Management**: "Returns cost you $5,230 last month, mostly from these 5 products"

### for Business Intelligence
- **Dashboard Ready**: Data structured for quality management dashboards
- **Supplier Reports**: Track supplier performance over time
- **Category Analysis**: Compare return rates across product categories
- **Seasonal Patterns**: Identify if certain products have seasonal quality issues

## Future Enhancements

### Advanced Analytics
- **Return Reason Categorization**: Automatic categorization of return reasons
- **Seasonal Analysis**: Compare return rates across seasons or promotional periods
- **Customer Segment Analysis**: Return patterns by customer type (new vs. returning)
- **Geographic Analysis**: Return rates by shipping region or country

### Predictive Capabilities
- **Quality Alerts**: Predict when a product's return rate is trending upward
- **Supplier Risk Assessment**: Early warning system for supplier quality issues
- **Customer Satisfaction Prediction**: Correlate return reasons with customer lifetime value
- **Inventory Impact**: Predict inventory needs accounting for expected returns

### Integration Opportunities
- **Supplier Communication**: Automated reports to suppliers about return rates
- **Customer Feedback Loop**: Connect return reasons to product reviews and ratings
- **Quality Assurance**: Integration with quality control and inspection processes
- **Marketing Optimization**: Adjust product descriptions based on return reasons

## Back-Office Integration Opportunity

### Product Quality Analytics Dashboard Widget

This product return rate analytics endpoint could also power a back-office analytics widget, providing store operators with immediate visibility into quality issues.

**Proposed Widget Features:**
- **Quality Alert Overview**: Show count of products above acceptable return rate threshold
- **Critical Issues**: Display top 5 products with highest return rates
- **Return Reason Insights**: Visual breakdown of most common return reasons
- **Financial Impact**: Show total cost of returns this month vs. last month
- **Trend Indicators**: Color-coded alerts (green: improving, yellow: stable, red: worsening)

**Widget Layout Example:**
```
┌─────────────────────────────────────────┐
│ Product Quality Alert                   │
├─────────────────────────────────────────┤
│ 8 products above 10% return rate        │
│                                         │
│ Critical Issues:                        │
│ • Headphones XYZ - 15.2% (↑ defects)    │
│ • Blue Jeans M - 12.8% (↑ size issues)  │
│ • Phone Case A - 11.1% (↓ improving)    │
│                                         │
│ Total Return Cost: $8,450 (↑ 23%)       │
└─────────────────────────────────────────┘
```

**Benefits for Back-Office Users:**
- **Immediate Alerts**: Dashboard visibility prevents quality issues from escalating
- **Action Prioritization**: Quick identification of products needing attention
- **Trend Monitoring**: Track whether quality initiatives are working
- **Cost Awareness**: Financial impact of quality issues visible at a glance

This would complement the AI/MCP integration by providing the same quality data to human operators through the back-office interface.

## Implementation Priority

**Medium-High** - While this feature addresses a critical gap in quality management, it requires foundational changes to the return/refund process before the analytics can be implemented.

**Implementation Phases:**
1. **Phase 1**: Enhance existing refund APIs to capture return reasons (foundational requirement)
2. **Phase 2**: Implement return analytics endpoint and MCP tools (main feature)
3. **Phase 3**: Add back-office quality analytics widget (additional value)

**Dependencies**: Requires modification of existing refund/return workflows to capture return reason data before analytics can provide meaningful insights.

**Business Justification**: Despite the implementation complexity, the ability to proactively identify quality issues and customer satisfaction problems provides significant long-term value for customer retention and operational efficiency.

## Success Metrics

### Quality Metrics
- **Early Detection Rate**: Percentage of quality issues identified before affecting 10+ customers
- **Return Rate Improvement**: Reduction in overall return rates after implementing quality actions
- **Supplier Quality**: Improvement in supplier quality scores based on return rate data

### Operational Metrics
- **API Response Time**: Target <500ms for typical queries
- **Data Accuracy**: Correlation between return rate calculations and actual business impact
- **Usage Adoption**: Percentage of stores using return rate analytics for quality management

### Business Impact
- **Cost Reduction**: Decrease in total return processing costs
- **Customer Satisfaction**: Improvement in product quality ratings and reviews
- **Supplier Relationships**: More data-driven and productive supplier quality discussions
- **Product Mix Optimization**: Better product selection based on quality performance data