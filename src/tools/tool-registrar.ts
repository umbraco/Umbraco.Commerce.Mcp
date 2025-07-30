import { ToolRegistrationContext } from "../types/tool-registration-context.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { withErrorHandling } from "../utils/tool-decorators.js";
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { z } from 'zod';
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ToolModuleSchema = z.object({
    default: z.object({
        name: z.string()
            .min(1, 'Tool name is required'),
        description: z.string()
            .min(1, 'Tool description is required'),
        schema: z.any().optional(), // Schema can be any Zod shape
        handler: z.function()
            .args(z.any(), z.any())
            .returns(z.any()),
        isAllowed: z.function()
            .args(z.any())
            .returns(z.boolean())
            .optional(),
    }).strict() // Don't allow unknown properties on the tool definition
}).passthrough(); // But allow additional exports from the module

export async function registerTools(context: ToolRegistrationContext): Promise<void> {
    const discoveredTools = await discoverTools();
    registerAllowedTools(context, discoveredTools);
}

export async function discoverTools(): Promise<ToolDefinition<any>[]> {
    const toolsDir = __dirname;
    const pattern = '**/*.tool.{js,ts}';
    
    const toolFiles = await glob(pattern, { 
        cwd: toolsDir,
        ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']
    });
    
    const tools: ToolDefinition<any>[] = [];
    
    for (const file of toolFiles) {
        const fullPath = path.resolve(toolsDir, file);
        const fileUrl = pathToFileURL(fullPath).href;
        const module = await import(fileUrl);
        const validationResult = ToolModuleSchema.safeParse(module);
        if (validationResult.success) {
            tools.push(withErrorHandling(validationResult.data.default));
        }
    }
    
    return tools;
}

const registerAllowedTools = (context: ToolRegistrationContext, tools: ToolDefinition<any>[]) => 
{
    tools.filter(tool => tool.isAllowed === undefined || tool.isAllowed(context.session))
        .forEach(tool => {
            if (tool.schema) {
                context.server.tool(tool.name, tool.description, tool.schema, tool.handler);
            } else {
                context.server.tool(tool.name, tool.description, tool.handler as ToolCallback<undefined>);
            }
        });
}