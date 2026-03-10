import { Role } from '@/types/firestore/user';

/**
 * Check if the user has the owner role
 */
export function isOwner(role: Role): boolean {
  return role === 'owner';
}

/**
 * Check if the user has the assistant role
 */
export function isAssistant(role: Role): boolean {
  return role === 'assistant';
}

/**
 * Check if the user can access owner routes
 * (owner or assistant)
 */
export function canAccessOwner(role: Role): boolean {
  return role === 'owner' || role === 'assistant';
}

/**
 * Check if the user is a customer
 */
export function isCustomer(role: Role): boolean {
  return role === 'customer';
}
