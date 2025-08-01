import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { client } from "./infrastructure/umbraco-commerce/index.js";
import { createUmbracoAuthClientPlugin } from "./infrastructure/plugins/umbraco-auth-client-plugin.js";
import { envSchema } from "./common/types/env.js";
import { sessionService } from "./common/session/services/session-service.js";
import { registerTools } from "./common/mcp/tools/tool-registrar.js";

// The main execution loop
const main = async () => {
    
    // Validate environment variables
    const env = envSchema.parse(process.env)
    
    // Create the MCP server
    const server = new McpServer({
        name: "umbraco-commerce-mcp-server",
        version: "1.0.0"
    });
    
    // Create an umbraco auth client plugin
    const authPlugin  = createUmbracoAuthClientPlugin({
        host: env.UMBRACO_BASE_URL!,
        clientId: env.UMBRACO_CLIENT_ID!,
        clientSecret: env.UMBRACO_CLIENT_SECRET!
    });

    // Install the plugin - this sets everything up
    authPlugin.install(client);
    
    // Fetch user session
    const session = await sessionService.getSession();
    
    // Register all tools and resources
    await registerTools({ server, session });

    // Start receiving messages on stdin and sending messages on stdout
    await server.connect(new StdioServerTransport());
};

// Global error handling
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});