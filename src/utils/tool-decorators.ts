import { ToolDefinition } from '../types/tool-definition.js';
import { UserSession } from '../types/user-session.js';
import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createErrorResult } from './tool-result-helpers.js';

/**
 * Tool decorator that automatically adds error handling
 */
export function withErrorHandling<Args extends ZodRawShape | undefined = undefined>(toolDef: ToolDefinition<Args>): ToolDefinition<Args> {
    return {
        ...toolDef,
        handler: (async (args: any, context: any) => {
            try
            {
                return await toolDef.handler(args, context);
            }
            catch (error)
            {
                return createErrorResult(`Error using ${toolDef.name}`, error instanceof Error ? error : new Error(String(error)));
            }
        }) as ToolCallback<Args>
    };
}

/**
 * Tool decorator that adds permission requirements
 */
export function requiresSection<Args extends ZodRawShape | undefined = undefined>(section: string) {
    return function(toolDef: ToolDefinition<Args>): ToolDefinition<Args> {
        return {
            ...toolDef,
            isAllowed: (session: UserSession) => {
                // Combine with existing permission check if present
                const existingCheck = toolDef.isAllowed?.(session) ?? true;
                return existingCheck && session.hasAccessToSection(section);
            }
        };
    };
}

/**
 * Tool decorator that adds admin requirement
 */
export function requiresAdmin<Args extends ZodRawShape | undefined = undefined>(toolDef: ToolDefinition<Args>): ToolDefinition<Args> {
    return {
        ...toolDef,
        isAllowed: (session: UserSession) => {
            const existingCheck = toolDef.isAllowed?.(session) ?? true;
            return existingCheck && session.user.isAdmin;
        }
    };
}

/**
 * Tool decorator that adds validation
 */
export function withValidation<Args extends ZodRawShape | undefined = undefined>(validator: (args: any) => boolean | string) {
    return function(toolDef: ToolDefinition<Args>): ToolDefinition<Args> {
        return {
            ...toolDef,
            handler: (async (args : any, context : any) => {
                const validationResult = validator(args);
                if (validationResult !== true) {
                    const message = typeof validationResult === 'string' 
                        ? validationResult 
                        : 'Validation failed';
                    throw new Error(`Validation error in ${toolDef.name}: ${message}`);
                }
                
                return toolDef.handler(args, context);
            }) as ToolCallback<Args>
        };
    };
}

/**
 * Compose multiple decorators into one
 */
export function compose<Args extends ZodRawShape | undefined = undefined>(...decorators: Array<(toolDef: ToolDefinition<Args>) => ToolDefinition<Args>>) {
    return function(toolDef: ToolDefinition<Args>): ToolDefinition<Args> {
        return decorators.reduce((decorated, decorator) => decorator(decorated), toolDef);
    };
}