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

**Details:** See [Advanced Filters Discoverability](advanced-filters-discoverability.md) for full technical specification.
