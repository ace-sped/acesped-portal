// Authentication utilities for the admin portal
// This file contains helper functions for authentication and authorization

export interface User {
  id: string;
  email: string;
  role: string;
  firstname?: string;
  surname?: string;
}

/**
 * Check if a user has SUPER_ADMIN role
 * @param user The user object to check
 * @returns boolean indicating if user is a super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.role === 'SUPER_ADMIN';
}

/**
 * Check if a user has any of the specified roles
 * @param user The user object to check
 * @param roles Array of roles to check against
 * @returns boolean indicating if user has one of the roles
 */
export function hasRole(user: User | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Get the current authenticated user from session/token
 * This is a placeholder - implement your actual authentication logic
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  // TODO: Implement actual authentication logic
  // This could involve:
  // 1. Reading session from cookies
  // 2. Verifying JWT token
  // 3. Fetching user from database
  // 4. Using NextAuth or similar
  
  return null;
}

/**
 * Verify if the current user can access admin routes
 * @returns boolean indicating if user can access admin
 */
export async function canAccessAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return isSuperAdmin(user);
}

/**
 * Authorization levels and their permissions
 */
export const PERMISSIONS = {
  SUPER_ADMIN: [
    'user.create',
    'user.read',
    'user.update',
    'user.delete',
    'role.manage',
    'system.configure',
    'logs.view',
    'database.manage',
    'reports.generate',
    'settings.update',
  ],
  Center_Leader: [
    'user.read',
    'staff.manage',
    'reports.view',
    'analytics.view',
  ],
  Deputy_Center_Leader: [
    'user.read',
    'reports.view',
    'programs.manage',
  ],
  Lecturer: [
    'course.manage',
    'student.view',
    'grades.manage',
  ],
  Student: [
    'course.view',
    'assignment.submit',
    'grades.view',
  ],
};

/**
 * Check if a user has a specific permission
 * @param user The user to check
 * @param permission The permission to check for
 * @returns boolean indicating if user has the permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  const userPermissions = PERMISSIONS[user.role as keyof typeof PERMISSIONS];
  return userPermissions?.includes(permission) || false;
}

