/**
 * Represents a reference to an Umbraco entity by its ID.
 */
export interface UmbracoReferenceById {
    id: string;
}

/**
 * Represents a user in the Umbraco system.
 */
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