import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ZodRawShape } from "zod";
import { UserSession } from "./umbraco-user.js";

export interface ToolDefinition<Args extends ZodRawShape | undefined = undefined> {
    name: string;
    description: string;
    schema: Args;
    handler: ToolCallback<Args>;
    isAllowed?: (user: UserSession) => boolean;
}