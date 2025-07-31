import { UmbracoUser } from '../types/umbraco-user.js';
import { client } from '../api/index.js';

/**
 * Lightweight service for accessing Umbraco user information
 * Uses the same authentication as the Commerce API
 */
class UmbracoUserService {
    async getCurrentUser(): Promise<UmbracoUser> {
        const response = await client.get({
            url: '/umbraco/management/api/v1/user/current'
        });
        return response.data as UmbracoUser;
    }
}

/**
 * Service for managing Umbraco user information
 */
export const umbracoUserService = new UmbracoUserService();