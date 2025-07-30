import { UmbracoUser, UserSession } from '../types/umbraco-user.js';

/**
 * Lightweight service for accessing Umbraco user information
 * Uses the same authentication as the Commerce API
 */
export class UmbracoUserService {
    private baseUrl: string;
    private getToken: () => Promise<string>;

    constructor(baseUrl: string, getToken: () => Promise<string>) {
        this.baseUrl = baseUrl;
        this.getToken = getToken;
    }
    
    async getCurrentUser(): Promise<UmbracoUser> {
        const token = await this.getToken();
        const response = await fetch(`${this.baseUrl}/umbraco/management/api/v1/user/current`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get current user: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }
    
    async getCurrentUserSession(): Promise<UserSession> {
        const user = await this.getCurrentUser();
        return {
            user,

            hasAccessToSection(section: string): boolean {
                return user.allowedSections.includes(section);
            },

            requireSection(section: string): void {
                if (!user.allowedSections.includes(section)) {
                    throw new Error(`User does not have access to section: ${section}`);
                }
            }
        };
    }
}