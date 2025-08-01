import { ZodRawShape } from "zod";
import { ToolCallback } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createErrorResult } from './tool-result-helpers.js';
import { Session } from "../../session/types/session.js";
import { ToolDefinition } from "./tool-definition.js";

/**
 * Tool decorator that automatically adds error handling
 */
export function withErrorHandling<TParams extends ZodRawShape | undefined = undefined, TResult extends ZodRawShape | undefined = undefined>(toolDef: ToolDefinition<TParams, TResult>): ToolDefinition<TParams, TResult> {
    return {
        ...toolDef,
        execute: (async (args: any, context: any) => {
            try
            {
                return await toolDef.execute(args, context);
            }
            catch (error)
            {
                return createErrorResult(`Error using ${toolDef.name}`, error instanceof Error ? error : new Error(JSON.stringify(error)));
            }
        }) as ToolCallback<TParams>
    };
}

/**
 * Tool decorator that adds permission requirements
 */
export function requiresSection<TParams extends ZodRawShape | undefined = undefined, TResult extends ZodRawShape | undefined = undefined>(section: string) {
    return function(toolDef: ToolDefinition<TParams, TResult>): ToolDefinition<TParams, TResult> {
        return {
            ...toolDef,
            canAccess: (session: Session) => {
                // Combine with existing permission check if present
                const existingCheck = toolDef.canAccess?.(session) ?? true;
                return existingCheck && session.hasAccessToSection(section);
            }
        };
    };
}

/**
 * Tool decorator that adds admin requirement
 */
export function requiresAdmin<TParams extends ZodRawShape | undefined = undefined, TResult extends ZodRawShape | undefined = undefined>(toolDef: ToolDefinition<TParams, TResult>): ToolDefinition<TParams, TResult> {
    return {
        ...toolDef,
        canAccess: (session: Session) => {
            const existingCheck = toolDef.canAccess?.(session) ?? true;
            return existingCheck && session.user.isAdmin;
        }
    };
}

/**
 * Tool decorator that adds validation
 */
export function withValidation<TParams extends ZodRawShape | undefined = undefined, TResult extends ZodRawShape | undefined = undefined>(validator: (args: any) => boolean | string) {
    return function(toolDef: ToolDefinition<TParams, TResult>): ToolDefinition<TParams, TResult> {
        return {
            ...toolDef,
            execute: (async (args : any, context : any) => {
                const validationResult = validator(args);
                if (validationResult !== true) {
                    const message = typeof validationResult === 'string' 
                        ? validationResult 
                        : 'Validation failed';
                    throw new Error(`Validation error in ${toolDef.name}: ${message}`);
                }
                
                return toolDef.execute(args, context);
            }) as ToolCallback<TParams>
        };
    };
}

/**
 * Compose multiple decorators into one
 */
export function compose<TParams extends ZodRawShape | undefined = undefined, TResult extends ZodRawShape | undefined = undefined>(...decorators: Array<(toolDef: ToolDefinition<TParams, TResult>) => ToolDefinition<TParams, TResult>>) {
    return function(toolDef: ToolDefinition<TParams, TResult>): ToolDefinition<TParams, TResult> {
        return decorators.reduce((decorated, decorator) => decorator(decorated), toolDef);
    };
}