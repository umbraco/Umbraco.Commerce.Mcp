# Dynamic Filter System for MCP Server

This document outlines how to implement a discoverable, extensible filter system for the Umbraco Commerce MCP server.

## 1. Filter Registry System

```typescript
// src/domains/orders/filters/filter-registry.ts
export interface FilterDefinition {
    key: string;
    name: string;
    description: string;
    category: string;
    valueType: 'string' | 'number' | 'boolean' | 'date' | 'array';
    examples: string[];
    supportedOperators?: string[];
}

class FilterRegistry {
    private filters = new Map<string, FilterDefinition>();
    
    register(filter: FilterDefinition): void {
        this.filters.set(filter.key, filter);
    }
    
    getAll(): FilterDefinition[] {
        return Array.from(this.filters.values());
    }
    
    getByCategory(category: string): FilterDefinition[] {
        return this.getAll().filter(f => f.category === category);
    }
}

export const orderFilterRegistry = new FilterRegistry();
```

## 2. New MCP Tool: `get_order_search_filters`

```typescript
// src/domains/orders/tools/get-order-search-filters-tool.ts
export default {
    name: 'get_order_search_filters',
    description: 'Get available filters for order search operations',
    
    execute: async (args, context) => {
        const filters = orderFilterRegistry.getAll();
        const categorized = filters.reduce((acc, filter) => {
            if (!acc[filter.category]) acc[filter.category] = [];
            acc[filter.category].push(filter);
            return acc;
        }, {} as Record<string, FilterDefinition[]>);
        
        return createJsonResult({
            filters: categorized,
            totalCount: filters.length,
            usage: "Use filters in search_orders tool with format: ['key:value']"
        });
    }
} satisfies ToolDefinition;
```

## 3. Updated Search Orders Tool Description

```typescript
// Update search-orders-tool.ts description
description: `Search orders with optional filtering and pagination.

DYNAMIC FILTERS:
Filters are extensible and discoverable. Use the 'get_order_search_filters' tool 
to get the current list of supported filters with examples and descriptions.

Basic usage: ["key:value", "anotherKey:anotherValue"]
Example: ["customerFirstName:mike", "tags:dispatched", "placedAfter:2025-01-01T10:00:00Z"]

For the most up-to-date filter documentation, call: get_order_search_filters`
```

## 4. Plugin System for Custom Filters

```typescript
// src/domains/orders/filters/filter-plugins.ts
export interface FilterPlugin {
    name: string;
    filters: FilterDefinition[];
    initialize?: () => Promise<void>;
}

export class FilterPluginManager {
    private plugins: FilterPlugin[] = [];
    
    register(plugin: FilterPlugin): void {
        this.plugins.push(plugin);
        plugin.filters.forEach(filter => orderFilterRegistry.register(filter));
    }
    
    async initializeAll(): Promise<void> {
        for (const plugin of this.plugins) {
            if (plugin.initialize) {
                await plugin.initialize();
            }
        }
    }
}

// Example custom plugin
export const customEcommerceFilters: FilterPlugin = {
    name: 'ecommerce-filters',
    filters: [
        {
            key: 'paymentMethod',
            name: 'Payment Method',
            description: 'Filter by payment method used',
            category: 'Payment',
            valueType: 'string',
            examples: ['paymentMethod:stripe', 'paymentMethod:paypal']
        }
    ]
};
```

## 5. Registration in Main Server

```typescript
// src/index.ts - add after auth setup
import { FilterPluginManager, customEcommerceFilters } from './domains/orders/filters/filter-plugins.js';

const filterManager = new FilterPluginManager();
filterManager.register(customEcommerceFilters);
await filterManager.initializeAll();
```

## 6. Enhanced Tool Response with Filter Hints

```typescript
// In search-orders-tool.ts execute function
if (!data || data.items.length === 0) {
    return createJsonResult({ 
        orders: [], 
        pagination: { page, pageSize, total: 0, totalPages: 0 },
        hint: "No results found. Use 'get_order_search_filters' to see available filters.",
        appliedFilters: filter || []
    });
}
```

## Benefits of This Approach:

1. **Discoverable** - Clients can call `get_order_search_filters` to see what's available
2. **Extensible** - New filters can be added via plugins without changing core code
3. **Self-documenting** - Each filter includes examples and descriptions
4. **Categorized** - Filters are organized by category for better UX
5. **Type-safe** - Full TypeScript support with schemas
6. **Version-aware** - Filter capabilities can evolve over time

This makes your MCP server much more flexible and allows clients to dynamically discover filtering capabilities rather than relying on static documentation.

## Implementation Steps

1. Create the filter registry system
2. Add the `get_order_search_filters` tool
3. Update the `search_orders` tool description to reference the discovery tool
4. Implement the plugin system for extensibility
5. Register core filters and any custom filters
6. Update search responses to include helpful hints

## Example Usage Flow

```javascript
// Client discovers available filters
const filters = await client.callTool('get_order_search_filters');
console.log(filters.filters.Customer); // Shows customer-related filters

// Client uses discovered filters
const orders = await client.callTool('search_orders', {
    storeIdOrAlias: 'default',
    filter: ['customerFirstName:john', 'placedAfter:2025-01-01T00:00:00Z']
});
```