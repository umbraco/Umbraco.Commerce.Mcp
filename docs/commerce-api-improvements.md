# Umbraco Commerce API Improvements for MCP Integration

This document outlines potential improvements to Umbraco Commerce APIs that would make AI/MCP integration more effective and developer-friendly.

## Overview

While building this MCP server, we've identified several areas where Umbraco Commerce's Management API could be enhanced to better support AI-driven interactions. These improvements would benefit not just MCP servers, but any application requiring programmatic access to Commerce functionality.

## API Enhancements

### 1. Advanced Filters Discoverability

**Problem:** The order search API supports advanced filters, but they are not discoverable through the API. This forces MCP implementations to hard-code extensive filter documentation (~30 lines) in tool descriptions, which doesn't scale as filters are pluggable.

**Proposed Solution:** Extend the existing `/orders/advanced-filters` endpoint to include AI-friendly metadata (`apiUsage` with description and examples) alongside the current UI metadata. This could be powered by C# attributes on filter class definitions.

**Benefits:** Eliminates hard-coded documentation, enables dynamic filter discovery, automatically includes new pluggable filters, and keeps documentation in sync with implementation.

**Priority:** High - Current blocker for scalable AI integration.

**Details:** See [Advanced Filters Discoverability](technical-specs/advanced-filters-discoverability.md) for full technical specification.

### 2. Natural Language Discount Creation

**Problem:** Umbraco Commerce's discount engine is extremely powerful and flexible, supporting complex combinations of rules and rewards. However, this flexibility makes it nearly impossible for AI to construct discounts, as each rule and reward requires detailed JSON configuration that would be impractical to describe to AI systems.

**Proposed Solution:** Implement a natural language discount parser that can interpret human-readable discount descriptions and automatically generate the appropriate discount configuration. This would accept requests like:
- "Create 20% discount to reduce everything store wide in the month of September"
- "Free shipping on orders over £50"
- "Buy 2 get 1 free on all clothing items"
- "£10 off orders over £100 for VIP customers"

**Benefits:** Massively simplifies AI discount creation, eliminates need to expose complex JSON schemas to AI, enables natural conversation about promotions, and reduces errors in discount configuration.

**Priority:** Medium - Would significantly improve AI usability for discount management.

**Details:** See [Natural Language Discount Creation](technical-specs/natural-language-discount-creation.md) for full technical specification and implementation approaches.

### 3. Low Stock Product Analytics

**Problem:** Commerce has endpoints for fetching individual product stock levels, but no efficient way to identify products with low stock across the entire catalog. This makes inventory management and restocking decisions time-consuming as it requires checking each product individually.

**Proposed Solution:** Add a new analytics endpoint that returns a list of products below a specified stock threshold. This would enable efficient identification of products needing restocking attention.

**Benefits:** Enables proactive inventory management, reduces time spent on stock monitoring, supports automated restocking workflows, and provides essential data for AI-driven inventory insights.

**Priority:** Medium - Important for inventory management use cases and store operations.

**Details:** See [Low Stock Product Analytics](technical-specs/low-stock-product-analytics.md) for full API specification.

### 4. Product Return Rate Analytics

**Problem:** Commerce currently lacks visibility into product return patterns and quality issues. Store operators cannot easily identify which products have high return rates, understand why products are being returned, or track quality trends over time. This makes it difficult to manage product quality, evaluate suppliers, and optimize the product mix.

**Proposed Solution:** Add a new analytics endpoint that provides comprehensive return rate analysis, including return percentages, return reasons, trend data, and financial impact. This would enable proactive quality management and data-driven business decisions.

**Benefits:** Enables proactive quality control, supports supplier performance evaluation, provides early warning for quality issues, and helps optimize product mix based on customer satisfaction data.

**Priority:** Medium-High - Critical for quality management, but requires foundational changes to return/refund process first.

**Details:** See [Product Return Rate Analytics](technical-specs/product-return-rate-analytics.md) for full API specification.
