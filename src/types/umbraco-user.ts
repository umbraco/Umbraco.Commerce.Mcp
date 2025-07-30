export interface UmbracoUser {
    id: string;
    email: string;
    userName: string;
    name: string;
    languageIsoCode: string;
    documentStartNodeIds: string[];
    mediaStartNodeIds: string[];
    hasDocumentRootAccess: boolean;
    hasMediaRootAccess: boolean;
    fallbackPermissions: string[];
    allowedSections: string[];
    avatarUrls: string[];
}

export interface UmbracoUserGroup {
    id: string;
    name: string;
    alias: string;
    icon: string;
    sections: string[];
    permissions: string[];
    hasAccessToAllLanguages: boolean;
    languageIds: string[];
}

export interface UmbracoPermissions {
    allowedAtRoot: boolean;
    isAllowedAtPath: boolean;
    permissions: string[];
}

/**
 * Session information for the current user, including their groups and permission methods.
 */
export interface UserSession {
    user: UmbracoUser;
    userGroups: UmbracoUserGroup[];
    userPermissions: UmbracoPermissions;
    
    // Permission checking methods
    hasAccessToSection(section: string): boolean;
    hasPermission(permission: string): boolean;
    hasAnyPermission(permissions: string[]): boolean;
    isInGroup(groupAlias: string): boolean;
    isInAnyGroup(groupAliases: string[]): boolean;
    hasGroupPermission(permission: string): boolean;
    hasGroupSectionAccess(section: string): boolean;
    requireSection(section: string): void;
    requirePermission(permission: string): void;
    requireAnyPermission(permissions: string[]): void;
    requireGroup(groupAlias: string): void;
}