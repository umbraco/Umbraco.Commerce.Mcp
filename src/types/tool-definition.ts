import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";
import { UserSession } from "./umbraco-user.js";

/**
 * Represents a tool definition with its metadata and handler function.
 */
export interface ToolDefinition<Args extends ZodRawShape | undefined = undefined> {
    name: string;
    description: string;
    schema?: Args;
    handler: ToolCallback<Args>;
    isAllowed?: (user: UserSession) => boolean;
}