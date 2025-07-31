import { UmbracoUser } from "./umbraco-user.js";
import { StoreClaimsDto } from "../api/index.js";

/**
 * Represents a session in Umbraco, providing access to user information and permissions.
 */
export class UserSession {
    public readonly user: UmbracoUser;
    public readonly stores: Array<StoreClaimsDto>;

    constructor(user: UmbracoUser, stores: Array<StoreClaimsDto> = []) {
        this.user = user;
        this.stores = stores;
    }

    /**
     * Check if user has access to a specific section
     */
    hasAccessToSection(section: string): boolean {
        return this.user.allowedSections.includes(section);
    }

    /**
     * Require access to a section, throwing error if not allowed
     */
    requireSection(section: string): void {
        if (!this.hasAccessToSection(section)) {
            throw new Error(`User does not have access to section: ${section}`);
        }
    }

    /**
     * Check if user is an admin
     */
    isAdmin(): boolean {
        return this.user.isAdmin;
    }

    /**
     * Check if user has access to sensitive data
     */
    hasAccessToSensitiveData(): boolean {
        return this.user.hasAccessToSensitiveData;
    }
}