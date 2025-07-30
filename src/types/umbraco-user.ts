export interface UmbracoReferenceById {
    id: string;
}

export interface UmbracoUser 
{
    id: string;
    email: string;
    userName: string;
    name: string;
    avatarUrls: string[];
    languages: string[];
    languageIsoCode: string | null;
    
    documentStartNodeIds: UmbracoReferenceById[];
    hasDocumentRootAccess: boolean;
    
    mediaStartNodeIds: UmbracoReferenceById[];
    hasMediaRootAccess: boolean;
    
    hasAccessToAllLanguages: boolean;
    hasAccessToSensitiveData: boolean;
    
    userGroupIds: UmbracoReferenceById[];
    allowedSections: string[];
    isAdmin: boolean;
}

export interface UserSession {
    user: UmbracoUser;
    hasAccessToSection(section: string): boolean;
    requireSection(section: string): void;
}