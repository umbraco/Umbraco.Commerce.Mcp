import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape} from "zod";
import { UserSession } from "./user-session.js";

/**
 * Represents a tool definition with its metadata and handler function.
 */
export interface ToolDefinition<InT extends ZodRawShape | undefined = undefined, OutT extends ZodRawShape | undefined = undefined> {
    name: string;
    description: string;
    inputSchema?: InT;
    outputSchema?: OutT;
    handler: ToolCallback<InT>;
    isAllowed?: (user: UserSession) => boolean;
}