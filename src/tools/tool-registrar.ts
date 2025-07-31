import { ToolRegistrationContext } from "../types/tool-registration-context.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { withErrorHandling } from "../utils/tool-decorators.js";
import { glob } from 'glob';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { toolModuleSchema} from "../types/schemas.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        const validationResult = toolModuleSchema.safeParse(module);
        if (validationResult.success) {
            tools.push(validationResult.data.default);
        } else {
            console.error(`Tool module at ${file} failed validation:`, validationResult.error);
        }
    }
    
    return tools;
}

const registerAllowedTools = (context: ToolRegistrationContext, tools: ToolDefinition<any>[]) => 
{
    tools.filter(tool => tool.isAllowed === undefined || tool.isAllowed(context.session))
        .map(withErrorHandling)
        .forEach(tool => {
            context.server.registerTool(tool.name, {
                description: tool.description,
                inputSchema: tool.inputSchema,
                outputSchema: tool.outputSchema,
            }, tool.handler);
        });
}