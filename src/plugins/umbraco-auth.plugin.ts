interface UmbracoAuthConfig {
    host: string;
    clientId: string;
    clientSecret: string;
}

interface UmbracoTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

interface UmbracoAuthPlugin {
    name: string;
    install: (clientInstance: any) => void;
    refreshToken: () => Promise<void>;
    getToken: () => Promise<string>;
}

// Token management class
class TokenManager {
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;
    private isRefreshing: boolean = false;
    private refreshPromise: Promise<string> | null = null;

    constructor(private config: UmbracoAuthConfig) {}

    async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        if (this.isRefreshing && this.refreshPromise) {
            return this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.fetchNewToken();

        try {
            return await this.refreshPromise;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    private async fetchNewToken(): Promise<string> {
        const tokenEndpoint = `${this.config.host}/umbraco/management/api/v1/security/back-office/token`;

        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
        });

        const response = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to obtain access token: ${response.status} ${errorText}`);
        }

        const tokenResponse: UmbracoTokenResponse = await response.json();
        this.accessToken = tokenResponse.access_token;
        this.tokenExpiry = new Date(Date.now() + (tokenResponse.expires_in - 30) * 1000);

        return this.accessToken;
    }

    async refreshToken(): Promise<void> {
        this.accessToken = null;
        await this.getAccessToken();
    }
}

/**
 * Creates an Umbraco authentication plugin for the Hey API client
 */
export function createUmbracoAuthPlugin(config: UmbracoAuthConfig): UmbracoAuthPlugin {
    const tokenManager = new TokenManager(config);

    return {
        name: 'umbraco-auth',

        /**
         * Installs the authentication plugin on the client instance
         */
        install: (clientInstance: any) => {
            
            // Configure base URL
            clientInstance.setConfig({
                baseUrl: config.host
            });

            // Add request interceptor for authentication
            clientInstance.interceptors.request.use(async (request: any) => {
                const token = await tokenManager.getAccessToken();
                request.headers.set('Authorization', `Bearer ${token}`);
                return request;
            });

            // Add response interceptor for handling 401s and token refresh
            clientInstance.interceptors.response.use(
                (response: any) => response,
                async (error: any) => {
                    const originalRequest = error.config;

                    // If we get a 401 and haven't already tried to refresh
                    if (error.response?.status === 401 && !originalRequest._isRetry) {
                        originalRequest._isRetry = true;

                        // Refresh token and retry request
                        await tokenManager.refreshToken();
                        const token = await tokenManager.getAccessToken();
                        originalRequest.headers.set('Authorization', `Bearer ${token}`);

                        return clientInstance.request(originalRequest);
                    }

                    return Promise.reject(error);
                }
            );
        },

        /**
         * Manually refresh the access token
         */
        refreshToken: () => tokenManager.refreshToken(),

        /**
         * Get the current access token (useful for debugging or external use)
         */
        getToken: () => tokenManager.getAccessToken()
    };
}

// Usage example:
/*
import { client } from './generated-api/client.gen';

const authPlugin = createUmbracoAuthPlugin({
  host: 'https://your-umbraco-site.com',
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// Install the plugin - this sets up everything
authPlugin.install(client);

// Now all API calls automatically handle authentication
import { ContentService } from './generated-api';
const content = await ContentService.getContent({ id: '123' });

// Optional: manually refresh token if needed
await authPlugin.refreshToken();

// Optional: get current token for debugging
const token = await authPlugin.getToken();
console.log('Current token:', token);
*/