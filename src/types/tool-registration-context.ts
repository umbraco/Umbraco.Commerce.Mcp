import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { UserSession } from "./umbraco-user.js";

/**
 * Context object passed to tool registration functions
 */
export interface ToolRegistrationContext {
    server: McpServer;
    session: UserSession;
}