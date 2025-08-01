import { UmbracoUser } from "../../../domains/umbraco/users/types/umbraco-user.js";
import { StoreClaimsDto } from "../../../infrastructure/umbraco-commerce/index.js";

/**
 * Represents a session in Umbraco, providing access to user information and permissions.
 */
export class Session {
    
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
}