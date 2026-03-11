/**
 * User role constants and helpers
 * Centralized role definitions to avoid hard-coding across the app
 */

export const USER_ROLES = {
  OWNER: 'owner',
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

/**
 * Roles that have access to admin panel
 */
export const PRIVILEGED_ROLES: UserRole[] = [
  USER_ROLES.OWNER,
  USER_ROLES.SUPERADMIN,
  USER_ROLES.ADMIN,
];

/**
 * Check if a role has admin privileges
 */
export function isPrivilegedRole(role: string | null | undefined): boolean {
  if (!role) return false;
  return PRIVILEGED_ROLES.includes(role as UserRole);
}

/**
 * Check if a role is owner
 */
export function isOwnerRole(role: string | null | undefined): boolean {
  return role === USER_ROLES.OWNER;
}

/**
 * Check if a role is customer
 */
export function isCustomerRole(role: string | null | undefined): boolean {
  return role === USER_ROLES.CUSTOMER;
}
