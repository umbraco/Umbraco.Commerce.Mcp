import { UmbracoUser, UmbracoUserGroup, UmbracoPermissions, UserSession } from '../types/umbraco-user.js';

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

    /**
     * Get current authenticated user details
     */
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

    /**
     * Get current user's groups
     */
    async getCurrentUserGroups(): Promise<UmbracoUserGroup[]> {
        const token = await this.getToken();
        const response = await fetch(`${this.baseUrl}/umbraco/management/api/v1/user/current/groups`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get current user groups: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        return result.items || [];
    }

    /**
     * Get current user's permissions for a specific path
     */
    async getCurrentUserPermissions(path?: string): Promise<UmbracoPermissions> {
        const token = await this.getToken();
        const url = path 
            ? `${this.baseUrl}/umbraco/management/api/v1/user/current/permissions?path=${encodeURIComponent(path)}`
            : `${this.baseUrl}/umbraco/management/api/v1/user/current/permissions`;
            
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to get current user permissions: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Get complete user session with permissions and groups
     */
    async getCurrentUserSession(): Promise<UserSession> {
        const user = await this.getCurrentUser();
        const userGroups = await this.getCurrentUserGroups();
        const userPermissions = await this.getCurrentUserPermissions();
        
        return {
            user,
            userGroups,
            userPermissions,

            hasAccessToSection(section: string): boolean {
                return user.allowedSections.includes(section);
            },

            hasPermission(permission: string): boolean {
                return user.fallbackPermissions.includes(permission);
            },

            hasAnyPermission(permissions: string[]): boolean {
                return permissions.some(permission => user.fallbackPermissions.includes(permission));
            },

            isInGroup(groupAlias: string): boolean {
                return userGroups.some(group => group.alias === groupAlias);
            },

            isInAnyGroup(groupAliases: string[]): boolean {
                return groupAliases.some(alias => userGroups.some(group => group.alias === alias));
            },

            hasGroupPermission(permission: string): boolean {
                return userGroups.some(group => group.permissions.includes(permission));
            },

            hasGroupSectionAccess(section: string): boolean {
                return userGroups.some(group => group.sections.includes(section));
            },

            requireSection(section: string): void {
                if (!user.allowedSections.includes(section) && !userGroups.some(group => group.sections.includes(section))) {
                    throw new Error(`User does not have access to section: ${section}`);
                }
            },

            requirePermission(permission: string): void {
                if (!user.fallbackPermissions.includes(permission) && !userGroups.some(group => group.permissions.includes(permission))) {
                    throw new Error(`User does not have permission: ${permission}`);
                }
            },

            requireAnyPermission(permissions: string[]): void {
                const hasAny = permissions.some(permission => 
                    user.fallbackPermissions.includes(permission) || userGroups.some(group => group.permissions.includes(permission))
                );
                
                if (!hasAny) {
                    throw new Error(`User does not have any of the required permissions: ${permissions.join(', ')}`);
                }
            },

            requireGroup(groupAlias: string): void {
                if (!userGroups.some(group => group.alias === groupAlias)) {
                    throw new Error(`User is not in required group: ${groupAlias}`);
                }
            }
        };
    }
}