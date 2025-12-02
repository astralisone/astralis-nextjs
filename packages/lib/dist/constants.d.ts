/**
 * Application constants
 */
export declare const APP_NAME = "Astralis One";
export declare const APP_DESCRIPTION = "Multi-Agent Engineering Platform";
export declare const ROLES: {
    readonly ADMIN: "ADMIN";
    readonly OPERATOR: "OPERATOR";
    readonly CLIENT: "CLIENT";
    readonly PM: "PM";
};
export type Role = (typeof ROLES)[keyof typeof ROLES];
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const API_VERSION = "v1";
//# sourceMappingURL=constants.d.ts.map