
import { Session } from "../types/session.js";
import { Session as SessionClient } from "../../../infrastructure/umbraco-commerce/index.js";
import { umbracoUserService } from "../../../features/umbraco/users/services/umbraco-user-service.js";

/**
 * Service for managing user sessions in the Umbraco Commerce context.
 * Provides methods to retrieve the current user session, including user details and store information.
 */
class SessionService {
    async getSession(): Promise<Session> {
        const user = await umbracoUserService.getCurrentUser();
        const ucSession = await SessionClient.getSession()
        return new Session(user, ucSession.data.stores);
    }
}

/**
 * Singleton instance of the SessionService.
 */
export const sessionService = new SessionService();