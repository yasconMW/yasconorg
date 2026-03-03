export const CMS_SESSION_COOKIE = "cms_session";

export const CMS_ROLES = ["super_admin", "regional_admin"] as const;
export type CmsRole = (typeof CMS_ROLES)[number];

export const CMS_REGIONS = [
  "national",
  "northern",
  "central",
  "southern",
  "eastern",
] as const;
export type CmsRegion = (typeof CMS_REGIONS)[number];

export const CMS_LEVELS = ["national", "regional"] as const;
export type CmsLevel = (typeof CMS_LEVELS)[number];

export const CMS_CONTENT_TYPES = ["blog", "news"] as const;
export type CmsContentType = (typeof CMS_CONTENT_TYPES)[number];

export const CMS_CATEGORIES = ["news", "impact", "press_release"] as const;
export type CmsCategory = (typeof CMS_CATEGORIES)[number];

export type CmsUserRecord = {
  id: number;
  name: string;
  email: string;
  role: CmsRole;
  region: CmsRegion;
  created_at: string;
};

