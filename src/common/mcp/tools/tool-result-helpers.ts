import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

/**
 * Creates a successful CallToolResult with JSON content
 */
export function createJsonResult(data: any): CallToolResult {
    return {
        content: [{
            type: "text",
            text: JSON.stringify(data, null, 2)
        }],
        structuredContent: data
    };
}

/**
 * Creates a successful CallToolResult with plain text content
 */
export function createTextResult(text: string): CallToolResult {
    return {
        content: [{
            type: "text",
            text
        }]
    };
}

/**
 * Creates an error CallToolResult
 */
export function createErrorResult(messageOrError: string | Error, error?: Error): CallToolResult {
    let finalMessage: string;
    
    if (typeof messageOrError === 'string' && error) {
        finalMessage = `${messageOrError}: ${error.message}`;
    } else if (typeof messageOrError === 'string') {
        finalMessage = messageOrError;
    } else {
        finalMessage = messageOrError.message;
    }
    
    return {
        content: [{
            type: "text",
            text: finalMessage
        }],
        isError: true
    };
}
