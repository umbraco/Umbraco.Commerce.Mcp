import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { client } from "./api/index.js";
import { createUmbracoAuthPlugin } from "./plugins/umbraco-auth.plugin.js";
import { ToolRegistrationContext } from "./types/tool-registration-context.js";
import { registerTools } from "./tools/tool-registrar.js";
import { envSchema } from "./types/schemas.js";
import {sessionService} from "./services/session-service.js";

// The main execution loop
const main = async () => {
    
    // Validate environment variables
    const env = envSchema.parse(process.env)
    
    // Create the MCP server
    const server = new McpServer({
        name: "umbraco-commerce-mcp-server",
        version: "1.0.0",
        capabilities: {
            resources: {},
            tools: {},
        },
    });
    
    // Create an umbraco auth client plugin
    const authPlugin  = createUmbracoAuthPlugin({
        host: env.UMBRACO_BASE_URL!,
        clientId: env.UMBRACO_CLIENT_ID!,
        clientSecret: env.UMBRACO_CLIENT_SECRET!
    });

    // Install the plugin - this sets everything up
    authPlugin.install(client);
    
    // Fetch user session
    const userSession = await sessionService.getUserSession();
    
    // Create the tool context to pass to tool registration functions
    const toolContext: ToolRegistrationContext = {
        server,
        session: userSession,
    };
    
    // Register all tools and resources
    await registerTools(toolContext);

    // Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
};

// Global error handling
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});