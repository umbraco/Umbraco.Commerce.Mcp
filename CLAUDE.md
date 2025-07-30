# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server for Umbraco Commerce that provides programmatic access to Umbraco Commerce APIs. The server acts as a bridge between MCP clients and Umbraco Commerce back-office APIs, handling authentication and request management.

## Architecture

### Core Components

- **MCP Server** (`src/index.ts`): Main entry point that creates the MCP server instance using `@modelcontextprotocol/sdk`
- **Authentication Plugin** (`src/plugins/umbraco-auth.plugin.ts`): Handles OAuth2 client credentials flow with automatic token refresh and request/response interceptors
- **Generated API Client** (`src/api/`): Auto-generated TypeScript client from Umbraco Commerce OpenAPI spec with type-safe operations
- **Token Management**: Built-in token caching, automatic refresh (30s before expiry), and 401 retry logic

### Authentication Flow

The authentication system uses OAuth2 client credentials flow:
1. Token manager fetches initial access token from `/umbraco/management/api/v1/security/back-office/token`
2. Tokens are cached with automatic refresh 30 seconds before expiry
3. Request interceptor adds `Bearer` tokens to all API calls
4. Response interceptor handles 401s by refreshing tokens and retrying requests once

### API Client Generation

The API client is generated from Umbraco Commerce's OpenAPI specification using `@hey-api/openapi-ts`. The generation process:
- Fetches OpenAPI spec from `${UMBRACO_BASE_URL}/umbraco/swagger/commerce-management/swagger.json`
- Generates TypeScript types, SDK classes, and Zod validation schemas
- Outputs to `src/api/` directory with full type safety

## Development Commands

### Build and Run
```bash
npm run build                    # Compile TypeScript to build/ directory
npx @modelcontextprotocol/inspector node build/index.js  # Run with MCP inspector
npm run inspect                  # Alias for inspector command
```

### API Client Generation
```bash
npm run generate:api             # Regenerate API client from OpenAPI spec
```

## Environment Configuration

Required environment variables (see `.env.example`):
- `UMBRACO_BASE_URL`: Base URL of the Umbraco instance
- `UMBRACO_CLIENT_ID`: OAuth2 client ID for back-office API access
- `UMBRACO_CLIENT_SECRET`: OAuth2 client secret

## Key Implementation Details

### Plugin System
The authentication plugin follows a standard pattern:
- `install(clientInstance)`: Configures base URL and adds interceptors
- `refreshToken()`: Manually triggers token refresh
- `getToken()`: Returns current access token

### User Service
A lightweight `UmbracoUserService` provides access to Umbraco CMS user information:
- `getCurrentUser()`: Get current authenticated user details
- `getCurrentUserGroups()`: Get user's groups and roles
- `getCurrentUserPermissions(path?)`: Get permissions for specific path
- `hasAccessToSection(section)`: Check section access (e.g., 'commerce', 'content')
- `hasPermission(permission, path?)`: Check specific permission

**Usage in MCP Tools**: Use the user service for authorization checks within other tools:
```typescript
// Example: Check if user has commerce section access before executing commerce operations
if (await userService.hasAccessToSection('commerce')) {
    // Execute commerce-related tool logic
} else {
    throw new Error('User does not have access to commerce section');
}
```

### Error Handling
- Global error handling in main execution loop
- Request/response interceptors handle authentication errors
- Token refresh failures bubble up as exceptions

### Node.js Requirements
- Minimum Node.js version: 22.0.0
- Uses ES modules (`"type": "module"`)
- Targets ES2022 with NodeNext module resolution