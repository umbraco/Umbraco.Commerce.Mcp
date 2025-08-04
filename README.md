# Umbraco Commerce MCP Server

> **⚠️ Work in Progress**  
> This project is currently a proof of concept and under active development. Features and APIs may change significantly before the first stable release.

A Model Context Protocol (MCP) server that provides AI tools for interacting with Umbraco Commerce APIs. This server acts as a bridge between AI assistants and Umbraco Commerce functionality, enabling operations like order management, analytics, discount management, and user administration.

## Quick Start

### Prerequisites

- Node.js >= 22.0.0
- Running Umbraco instance with Commerce
- OAuth2 client credentials for Umbraco back-office API access

### Installation

```bash
npm install
```

### Configuration

1. Create `.env` file from the example:
```bash
cp .env.example .env
```

2. Configure required environment variables:
```env
UMBRACO_CLIENT_ID=your_oauth_client_id
UMBRACO_CLIENT_SECRET=your_oauth_client_secret
UMBRACO_BASE_URL=https://your-umbraco-site.com
```

### Running the Server

```bash
# Build and start the MCP server
npm run start

# Start with MCP inspector for debugging
npm run inspect
```

## Development

### Project Structure

```
src/
├── features/                    # Domain-organized features
│   ├── analytics/              # Analytics and reporting tools
│   ├── discounts/              # Discount management tools
│   ├── orders/                 # Order management tools
│   ├── stores/                 # Store statistics and management
│   ├── ...                     # Other features to come
│   └── umbraco/users/          # User session management
├── common/                     # Shared utilities and types
│   ├── mcp/tools/              # MCP tool framework
│   ├── session/                # Session management
│   └── types/                  # Common type definitions
└── infrastructure/             # External integrations
    └── umbraco-commerce/       # Auto-generated API client
```

### Available Commands

```bash
# Development
npm run build                   # Build TypeScript
npm run start                   # Build and start server
npm run inspect                 # Start with MCP inspector

# API Generation
npm run generate:api            # Generate API client from OpenAPI spec

# Testing
npm run test:tools              # Test tools using YAML files
npm run test:compliance         # Run MCP compliance tests
```

### Creating New Tools

1. Create a tool file in the appropriate feature directory:
```typescript
// src/features/example/tools/my-tool.ts
import { z } from "zod";
import type { ToolDefinition } from "../../../common/mcp/tools/tool-definition.js";

const paramsSchema = z.object({
  param1: z.string().describe("Description of parameter")
});

export default {
  name: "my_tool",
  description: "Tool description with usage examples",
  paramsSchema: paramsSchema.shape,
  canAccess: (session) => session.hasAccessToSection("commerce"),
  execute: async (args, context) => {
    // Tool implementation
    return createJsonResult({ success: true });
  }
} satisfies ToolDefinition<typeof paramsSchema.shape>;
```

2. Tools are automatically discovered from `src/features/*/tools/*{.,-}tool.{js,ts}` files

### Creating New Resources

TBC

## Authentication

The server uses OAuth2 client credentials flow with automatic token refresh. To set up authentication:

1. Create an API user in your Umbraco back-office following the [Umbraco API Users documentation](https://docs.umbraco.com/umbraco-cms/fundamentals/data/users/api-users)
2. Ensure the API user has access to the Commerce/Settings sections
3. Use the client ID and secret in your `.env` configuration

## API Integration

The project uses an auto-generated API client from Umbraco Commerce's Management API specification. To regenerate the client:

```bash
npm run generate:api
```

This requires a running Umbraco instance.

## Testing

Testing is done using [mcp-server-tester](https://github.com/steviec/mcp-server-tester). Create YAML test files in the `tests/` directory:

```yaml
tools:
  expected_tool_list: ['search_orders', 'get_order']
  tests:
    - name: 'Search orders test'
      tool: 'search_orders'
      params: 
        storeId: 'default'
        take: 10
      expect:
        success: true
```

Run tests with:
```bash
npm run test:tools
```

See the [mcp-server-tester documentation](https://github.com/steviec/mcp-server-tester) for more details on test configuration and options.

## Development & Planning

This project is guided by real-world use cases and requirements. Development documentation includes:

- **[Use Cases](docs/use-cases.md)** - Store owner scenarios and essential MCP endpoints
- **[Suggested Commerce API Improvements](docs/commerce-api-improvements.md)** - Proposed enhancements to Umbraco Commerce APIs for better AI integration

These documents help guide feature development and identify areas where Umbraco Commerce APIs may need enhancement to better support AI-driven interactions.

## License

This MCP server is MIT licensed. However, it requires Umbraco Commerce, which is a commercially licensed product by Umbraco A/S. You will need a valid Umbraco Commerce license to use this tool with a production Umbraco instance.
