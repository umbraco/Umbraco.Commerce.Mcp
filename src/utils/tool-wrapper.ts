import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ZodRawShape } from "zod";

export function withErrorHandling<Args extends ZodRawShape | undefined = any>(
    toolName: string,
    handler: ToolCallback<Args>
): ToolCallback<Args> {
    return (async (args: any, context: any) => {
        try 
        {
            return await handler(args, context);
        } 
        catch (error) 
        {
            // Log the error
            console.error(`Error in tool ${toolName}:`, error);
            
            const errorDetails = error instanceof Error
                ? {
                    message: error.message,
                    cause: error.cause,
                    response: (error as any).response?.data,
                }
                : error;

            return {
                content: [
                    {
                        type: "text" as const,
                        text: `Error using ${toolName}:\n${JSON.stringify(
                            errorDetails,
                            null,
                            2
                        )}`,
                    },
                ],
            };
        }
    }) as ToolCallback<Args>;
}