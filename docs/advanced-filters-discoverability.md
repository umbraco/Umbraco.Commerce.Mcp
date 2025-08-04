# Advanced Filters API Discoverability

This document details a proposed enhancement to make Umbraco Commerce's advanced filters more discoverable and usable for AI/MCP integration.

## Current Problem

The order search API supports advanced filters, but they are not discoverable through the API. This forces MCP implementations to hard-code filter descriptions and usage patterns, which is not scalable as advanced filters are pluggable.

## Current State

### Hard-Coded Documentation in MCP Tools
MCP tools must maintain extensive hard-coded filter documentation in tool descriptions:

```typescript
// From src/features/orders/tools/search-orders-tool.ts
description: `Search orders with optional filtering and pagination.

SUPPORTED FILTERS:
Use the 'filters' parameter with an array of strings in "key:value" format:

System Filters:
- term:searchTerm - Search for orders containing the term in any searchable field
- orderStatus:fd0c6eec-ba3f-41c2-87c4-4bd2201e9921 - Filter by order status ID (exact match)
- paymentStatus:Initialized - Filter by payment status (One of Initialized, Authorized, Captured...)

Customer Filters:
- customerFirstName:john - Filter by customer first name (partial match)
- customerLastName:doe - Filter by customer last name (partial match)
- customerEmailAddress:john@example.com - Filter by exact customer email

Date Filters:
- placedBefore:2025-12-31 - Orders placed before date (yyyy-MM-ddTHH:mm:ssZ)
- placedAfter:2025-12-31 - Orders finalized before date (yyyy-MM-ddTHH:mm:ssZ)

Order Properties:
- orderNumber:ORDER-01982-28796-ZVTT6 - Filter by order number (partial match)
- props:size:xl,color:!blue, - Filter by order properties (comma-separated key:value, ! excludes)
- tags:tag1,tag2 - Filter by order tags (exact match)

Order Line Properties:
- skus:SKU123,SKU456 - Filter by order line SKUs (exact match)
- orderlineProps:color:red,size:!large - Filter by order line properties (comma-separated key:value, ! excludes)

Example: ["customerFirstName:mike", "tags:dispatched", "placedAfter:2025-01-01T10:00:00Z"]`
```

### Problems with Current Approach
- **Maintenance Burden**: Filter documentation must be manually updated when new filters are added
- **Synchronization Issues**: Tool descriptions can become out of sync with actual Commerce capabilities
- **Not Scalable**: Pluggable filters from third-party packages aren't automatically documented
- **Error Prone**: Complex filter syntax is difficult for AI to construct correctly without examples
- **Discovery**: No way to programmatically discover what filters are available for different contexts

### Existing Advanced Filters Endpoint

Commerce has an endpoint for retrieving available filters:

```http
GET /umbraco/commerce/management/api/v1/orders/advanced-filters
```

**Current Response:**
The endpoint currently returns UI-focused metadata for building the back-office filter interface:

```json
[
  {
    "group": "customer",
    "properties": [
      {
        "alias": "customerFirstName",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      },
      {
        "alias": "customerLastName", 
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      },
      {
        "alias": "customerEmailAddress",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      }
    ]
  },
  {
    "group": "order",
    "properties": [
      {
        "alias": "orderNumber",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      },
      {
        "alias": "placedAfter",
        "editorConfig": [
          {
            "alias": "offsetTime",
            "value": true
          }
        ],
        "editorUiAlias": "Umb.PropertyEditorUi.DatePicker"
      },
      {
        "alias": "placedBefore",
        "editorConfig": [
          {
            "alias": "offsetTime", 
            "value": true
          }
        ],
        "editorUiAlias": "Umb.PropertyEditorUi.DatePicker"
      },
      {
        "alias": "props",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      },
      {
        "alias": "tags",
        "editorUiAlias": "Umb.PropertyEditorUi.Tags"
      }
    ]
  },
  {
    "group": "orderLine", 
    "properties": [
      {
        "alias": "skus",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      },
      {
        "alias": "orderlineProps",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox"
      }
    ]
  }
]
```

**Limitations for AI/MCP Usage:**
- No human-readable names or descriptions
- Editor UI aliases don't translate to API usage patterns
- No examples of valid filter values or syntax
- No indication of supported operators or value formats

## Proposed Enhancement

Extend the existing structure to include AI/MCP-friendly metadata alongside the existing UI metadata:

```json
[
  {
    "group": "customer",
    "groupName": "Customer Filters",
    "properties": [
      {
        "alias": "customerFirstName",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox",
        "apiUsage": {
          "description": "Filter orders by customer first name (partial match)",
          "examples": ["customerFirstName:john"]
        }
      },
      {
        "alias": "customerEmailAddress",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox",
        "apiUsage": {
          "description": "Filter orders by customer email address (exact match)",
          "examples": ["customerEmailAddress:john@example.com"]
        }
      }
    ]
  },
  {
    "group": "order",
    "groupName": "Order Filters",
    "properties": [
      {
        "alias": "placedAfter",
        "editorConfig": [
          {
            "alias": "offsetTime",
            "value": true
          }
        ],
        "editorUiAlias": "Umb.PropertyEditorUi.DatePicker",
        "apiUsage": {
          "description": "Filter orders placed after the specified date (yyyy-MM-ddTHH:mm:ssZ format)",
          "examples": ["placedAfter:2025-01-01T10:00:00Z"]
        }
      },
      {
        "alias": "props",
        "editorUiAlias": "Umb.PropertyEditorUi.TextBox",
        "apiUsage": {
          "description": "Filter by order properties using comma-separated key:value format. To exclude a value, prefix it with an exclamation mark (!)",
          "examples": ["props:size:xl,color:!red"]
        }
      }
    ]
  }
]
```

## Benefits

- **Eliminates Hard-Coding**: No more need to maintain extensive filter documentation in tool descriptions
- **AI-Friendly**: AI can dynamically discover and use all available filters with proper syntax
- **Self-Documenting**: Filter capabilities are exposed directly through the API
- **Scalable**: New pluggable filters automatically become available to AI without code changes
- **Always Current**: Filter documentation stays in sync with actual Commerce capabilities
- **Type-Safe**: Clear value types and formats reduce errors
- **Better UX**: Tools can provide real-time filter validation and suggestions

## Impact on MCP Tools

With this enhancement, the search orders tool description could be simplified from ~30 lines of hard-coded filter documentation to:

```typescript
// Simplified tool description
description: `Search orders with optional filtering and pagination. 
Use the get_order_filters tool to discover available filter options and syntax.`
```

And a new complementary tool could provide dynamic filter discovery:

```typescript
// New dynamic filter discovery tool
const getOrderFiltersTool = {
    name: 'get_order_filters',
    description: 'Get available order search filters with usage examples and syntax',
    execute: async () => {
        const { data } = await Order.getAvailableFilters();
        return createJsonResult(data);
    }
};
```

## Implementation Approach

The API usage metadata could be powered by custom C# attributes on advanced filter definitions, making it maintainable and ensuring it stays in sync with the actual filter implementation:

```csharp
[AdvancedFilter("customerFirstName", Group = "customer")]
[ApiUsage(
    Description = "Filter orders by customer first name (partial match)",
    Examples = new[] { "customerFirstName:john" }
)]
public class OrderCustomerFirstNameAdvancedFilter : OrderAdvancedFilterBase
{
    public override bool CanApply(string value)
    {
        return !string.IsNullOrWhiteSpace(value);
    }

    public override IQuerySpecification<OrderReadOnly> Apply(IQuerySpecification<OrderReadOnly> query, IOrderQuerySpecificationFactory where, string value)
    {
        return query.And(where.HasCustomerFirstName(value, StringComparisonType.Contains));
    }
}
```

### Benefits of Attribute-Based Approach
- **Single Source of Truth**: API documentation lives alongside the filter implementation
- **Compile-Time Safety**: API documentation is validated at build time
- **Automatic Discovery**: New filters with attributes are automatically included in API responses
- **Developer-Friendly**: Filter authors provide API documentation as they write the filter
- **Version Control**: API documentation changes are tracked alongside code changes
- **IntelliSense Support**: IDE can provide hints when writing filter documentation

## Future Enhancement - Strongly Typed Filters

Consider moving toward a more structured filter system:

```http
POST /umbraco/commerce/orders/search
{
  "filters": {
    "orderStatus": {
      "operator": "in",
      "values": ["pending", "processing"]
    },
    "customerEmail": {
      "operator": "contains", 
      "value": "@company.com"
    },
    "totalAmount": {
      "operator": "between",
      "min": 50.00,
      "max": 200.00
    },
    "createdDate": {
      "operator": "range",
      "from": "2024-01-01T00:00:00Z",
      "to": "2024-12-31T23:59:59Z"
    }
  },
  "pagination": {
    "skip": 0,
    "take": 20
  }
}
```

## Implementation Priority

**High** - This is a blocker for scalable AI integration with Commerce filtering.