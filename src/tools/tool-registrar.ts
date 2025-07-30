import { ToolRegistrationContext } from "../types/tool-registration-context.js";
import { ToolDefinition } from "../types/tool-definition.js";
import { orderTools } from "./order/index.js";

export function registerTools(context: ToolRegistrationContext): void
{
    registerAllowedTools(context, [
        ...orderTools(context),
    ]);
}

const registerAllowedTools = (context: ToolRegistrationContext, tools: ToolDefinition<any>[]) => {
    return tools.forEach(tool => {
        if ((tool.isAllowed === undefined || tool.isAllowed(context.session))) {
            context.server.tool(tool.name, tool.description, tool.schema, tool.handler);
        }
    })
}