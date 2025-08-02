# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **Umbraco Commerce MCP (Model Context Protocol) Server** that provides AI tools for interacting with Umbraco Commerce APIs. The server acts as a bridge between AI assistants and Umbraco Commerce functionality, enabling operations like order search, user management, and commerce data retrieval.

### Key Architecture Components

- **MCP Server**: Built using `@modelcontextprotocol/sdk` for AI tool integration
- **Tool System**: Auto-discovering, decorator-based tool registration
- **Domain-Driven Structure**: Organized by business domains (orders, users, etc.)
- **Authentication**: OAuth2 client credentials flow with automatic token refresh
- **API Client**: Auto-generated from Umbraco Commerce OpenAPI specification

## Development Commands

### Build and Run
```bash
npm run build                    # Build TypeScript to build/ directory
npm run start                   # Build and start the MCP server
npm run inspect                 # Start with MCP inspector for debugging
```

### API Generation
```bash
npm run generate:api            # Generate API client from Umbraco Commerce OpenAPI spec
```

### Testing
```bash
npm run test:tools              # Test individual tools using YAML test files
npm run test:compliance         # Run MCP compliance tests
```

## Environment Configuration

Create `.env` file with required variables (see `.env.example`):
- `UMBRACO_CLIENT_ID`: OAuth2 client ID for Umbraco back-office
- `UMBRACO_CLIENT_SECRET`: OAuth2 client secret
- `UMBRACO_BASE_URL`: Base URL of Umbraco instance

## Tool Development

### Tool Discovery
Tools are auto-discovered from `src/features/*/tools/*{.,-}tool.{js,ts}` files. Each tool must export a default `ToolDefinition` object.

### Tool Structure
```typescript
export default {
    name: 'tool_name',
    description: 'Tool description with usage examples',
    paramsSchema: zodSchema.shape,
    canAccess: (session: Session) => boolean,  // Optional permission check
    execute: async (args, context) => { ... }
} satisfies ToolDefinition<typeof zodSchema.shape>;
```

### Tool Decorators
Available decorators in `src/common/mcp/tools/tool-decorators.ts`:
- `withErrorHandling()`: Automatic error handling (applied to all tools)
- `requiresSection(section)`: Require access to specific Umbraco section
- `requiresAdmin()`: Require admin permissions
- `withValidation(validator)`: Custom validation logic
- `compose(...decorators)`: Combine multiple decorators

### Session and Permissions
Tools receive a `Session` object containing:
- User information from Umbraco back-office
- Available Umbraco Commerce stores
- Methods: `hasAccessToSection(section)`, `user.isAdmin`

## API Client Architecture

### Generated Client
The API client is auto-generated from Umbraco Commerce's OpenAPI specification using `@hey-api/openapi-ts`. Generated files are in `src/infrastructure/umbraco-commerce/`.

### Authentication Plugin
The `UmbracoAuthClientPlugin` handles:
- OAuth2 client credentials authentication
- Automatic token refresh on 401 responses
- Request/response interceptors for token management

### Client Usage
```typescript
import { client } from "./infrastructure/umbraco-commerce/index.js";
import { Order } from "./infrastructure/umbraco-commerce/index.js";

// Client is pre-configured with auth plugin
const response = await Order.getOrders({
    headers: { store: storeIdOrAlias },
    query: { skip: 0, take: 10 }
});
```

## Domain Structure

### Orders Domain (`src/features/orders/`)
- **Tools**: `search-orders-tool.ts`, `get-order-by-id-tool.ts`
- **Types**: Order mapping and transformation utilities
- **Features**: Advanced filtering, pagination, customer/product searches

### Umbraco Users Domain (`src/features/umbraco/users/`)
- **Services**: Current user retrieval and session management
- **Types**: User permission and access control models

## Common Patterns

### Pagination
Use the `paginator` utility from `src/common/types/pagination.ts` for cursor-based pagination:
```typescript
const { data, nextCursor } = await paginator.paginate<T>(
    async (page, pageSize) => ({ data: T[], total: number }),
    { cursor }
);
```

### Error Handling
Use `createErrorResult()` and `createJsonResult()` from `tool-result-helpers.ts` for consistent tool responses.

### Type Safety
All tools use Zod schemas for parameter validation and TypeScript for type safety throughout the application.

## Testing

### Tool Tests
Create YAML test files in `tests/` directory:
```yaml
tools:
  expected_tool_list: ['tool_name']
  tests:
    - name: 'Test Description'
      tool: 'tool_name'
      params: { param1: 'value1' }
      expect: { success: true }
```

### Requirements
- Node.js >= 22.0.0
- Valid Umbraco Commerce instance with API access
- Configured OAuth2 client credentials

## Important Notes

- All tools automatically include error handling via the `withErrorHandling` decorator
- The server requires a valid Umbraco session with Commerce section access
- API client generation depends on a running Umbraco instance with accessible OpenAPI spec
- Tools are filtered by user permissions before registration with the MCP server