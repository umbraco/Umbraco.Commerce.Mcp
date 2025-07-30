import { ToolRegistrationContext } from "../types/tool-registration-context.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { withErrorHandling } from "../utils/tool-wrapper.js";
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';
import {ToolCallback} from "@modelcontextprotocol/sdk/server/mcp.js";

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
    
    try {
        const toolFiles = await glob(pattern, { 
            cwd: toolsDir,
            ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**']
        });
        
        const tools: ToolDefinition<any>[] = [];
        
        for (const file of toolFiles) {
            try {
                const fullPath = path.resolve(toolsDir, file);
                const module = await import(fullPath);
                
                const validationResult = ToolModuleSchema.safeParse(module);
                
                if (validationResult.success) {
                    tools.push(validationResult.data.default);
                    console.log(`✓ Discovered tool: ${validationResult.data.default.name} from ${file}`);
                } else {
                    console.warn(`✗ Invalid tool module in ${file}:`);
                    validationResult.error.errors.forEach(err => {
                        console.warn(`  - ${err.path.join('.')}: ${err.message}`);
                    });
                }
            } catch (error) {
                console.warn(`Failed to load tool from ${file}:`, error instanceof Error ? error.message : error);
            }
        }
        
        return tools;
    } catch (error) {
        console.error('Tool discovery failed:', error);
        return [];
    }
}

const registerAllowedTools = (context: ToolRegistrationContext, tools: ToolDefinition<any>[]) => 
{
    tools.filter(tool => tool.isAllowed === undefined || tool.isAllowed(context.session))
        .forEach(tool => {
            if (tool.schema) {
                context.server.tool(tool.name, tool.description, tool.schema, withErrorHandling(tool.name, tool.handler));
            } else {
                context.server.tool(tool.name, tool.description, withErrorHandling(tool.name, tool.handler) as ToolCallback<undefined>);
            }
        });
}