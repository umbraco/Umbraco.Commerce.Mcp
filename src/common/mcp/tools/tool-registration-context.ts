import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Session } from "../../session/types/session.js";

/**
 * Context object passed to tool registration functions
 */
export interface ToolRegistrationContext {
    server: McpServer;
    session: Session;
}