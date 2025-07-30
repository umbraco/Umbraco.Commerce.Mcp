import { ToolRegistrationContext } from "../../types/tool-registration-context.js";
import getOrderByIdTool from "./get/get-order-by-id.js";

export const orderTools = (context: ToolRegistrationContext) => ([
    ...[
        // Add tools here that don't require special permissions
        getOrderByIdTool,
    ],
    ...(context.session.hasAccessToSection('settings') ? [
        // Add tools here that require 'settings' section access
        // e.g., createOrderTool, updateOrderTool, deleteOrderTool
    ] : [])
])