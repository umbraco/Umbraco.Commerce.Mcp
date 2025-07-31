import { UserSession } from "../types/user-session.js";
import { umbracoUserService } from "./umbraco-user.service.js";
import { Session as SessionClient } from '../api/index.js'

/**
 * Service for managing user sessions in the Umbraco Commerce context.
 * Provides methods to retrieve the current user session, including user details and store information.
 */
class SessionService {
    async getUserSession(): Promise<UserSession> {
        const user = await umbracoUserService.getCurrentUser();
        const ucSession = await SessionClient.getSession()
        return new UserSession(user, ucSession.data.stores);
    }
}

/**
 * Singleton instance of the SessionService.
 */
export const sessionService = new SessionService();