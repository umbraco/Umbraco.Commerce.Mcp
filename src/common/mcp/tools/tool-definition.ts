import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z, ZodRawShape } from "zod";
import { Session } from "../../session/types/session.js";

/**
 * Schema for defining a tool's metadata and handler function.
 * 
 * This schema is used to validate the structure of tool definitions
 * before they are registered with the MCP server.
 */
export const toolDefinitionSchema = z.object({
    name: z.string()
        .min(1, 'Tool name is required'),
    description: z.string()
        .min(1, 'Tool description is required'),
    paramsSchema: z.any().optional(), // Schema can be any Zod shape
    resultSchema: z.any().optional(), // Schema can be any Zod shape
    execute: z.function()
        .args(z.any(), z.any())
        .returns(z.any()),
    canAccess: z.function()
        .args(z.any())
        .returns(z.boolean())
        .optional(),
}).strict()

/**
 * Represents a tool definition with its metadata and handler function.
 */
export interface ToolDefinition<TParams extends ZodRawShape | undefined = undefined, TResult extends ZodRawShape | undefined = undefined> {
    name: string;
    description: string;
    paramsSchema?: TParams;
    resultSchema?: TResult;
    execute: ToolCallback<TParams>;
    canAccess?: (session: Session) => boolean;
}