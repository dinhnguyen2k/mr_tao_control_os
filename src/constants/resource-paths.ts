/**
 * Centralized resource path constants.
 *
 * Single source of truth for Firestore collection mapping and service resource URLs.
 * Both `firebase-client.ts` (KNOWN_RESOURCE_PATHS) and individual service files
 * import from here to eliminate duplication and prevent mapping drift.
 */

export const RESOURCE_PATH = {
  STORES: '/stores',
  STAFF: '/staff',
  STAFF_PERMISSIONS: '/staff/permissions',
  REPORTS_DAILY: '/reports/daily',
  KPI_STAFF_RANKS: '/kpi/staff-ranks',
  CHECKLIST_CATEGORIES: '/checklist/categories',
  CHECKLIST_ITEMS: '/checklist/items',
  TODAY_TIMELINE: '/today/timeline',
  TODAY_STATS: '/today/stats',
  ISSUES: '/issues',
  TASKS: '/tasks',
} as const;

export type ResourcePath = (typeof RESOURCE_PATH)[keyof typeof RESOURCE_PATH];

/** Ordered list used by firebase-client to resolve URL → collection name. */
export const KNOWN_RESOURCE_PATHS: ResourcePath[] = Object.values(RESOURCE_PATH);
