// Permission System for Granular RBAC
// Defines available permissions and provides checking functions

export type PermissionName =
    // User Management
    | 'manage_users'
    | 'view_users'
    | 'edit_user_roles'
    | 'edit_user_plans'
    | 'ban_users'
    // Market Data
    | 'manage_market_data'
    | 'edit_prices'
    | 'view_analytics'
    // Currency
    | 'manage_currencies'
    | 'update_rates'
    // System
    | 'view_audit_logs'
    | 'manage_permissions'
    | 'manage_announcements'
    | 'manage_gallery'
    | 'export_data'

export type PermissionCategory = 'users' | 'market_data' | 'currency' | 'system'

interface PermissionDef {
    name: PermissionName
    description: string
    category: PermissionCategory
}

// Define all available permissions
export const PERMISSIONS: PermissionDef[] = [
    // User Management
    { name: 'manage_users', description: 'Full user management access', category: 'users' },
    { name: 'view_users', description: 'View user list and details', category: 'users' },
    { name: 'edit_user_roles', description: 'Change user roles (staff/super user)', category: 'users' },
    { name: 'edit_user_plans', description: 'Change user subscription plans', category: 'users' },
    { name: 'ban_users', description: 'Ban/unban users', category: 'users' },

    // Market Data
    { name: 'manage_market_data', description: 'Full market data management', category: 'market_data' },
    { name: 'edit_prices', description: 'Edit product prices', category: 'market_data' },
    { name: 'view_analytics', description: 'View analytics and reports', category: 'market_data' },

    // Currency
    { name: 'manage_currencies', description: 'Full currency management', category: 'currency' },
    { name: 'update_rates', description: 'Update currency exchange rates', category: 'currency' },

    // System
    { name: 'view_audit_logs', description: 'View system audit logs', category: 'system' },
    { name: 'manage_permissions', description: 'Grant/revoke permissions', category: 'system' },
    { name: 'manage_announcements', description: 'Manage announcements', category: 'system' },
    { name: 'manage_gallery', description: 'Manage gallery images', category: 'system' },
    { name: 'export_data', description: 'Export system data', category: 'system' },
]

// Default permission sets for each role
export const ROLE_PERMISSIONS: Record<string, PermissionName[]> = {
    superuser: [
        // Superusers get all permissions
        ...PERMISSIONS.map(p => p.name),
    ],
    staff: [
        // Staff get most permissions except critical system ones
        'view_users',
        'edit_user_plans',
        'manage_market_data',
        'edit_prices',
        'view_analytics',
        'manage_currencies',
        'update_rates',
        'manage_announcements',
        'manage_gallery',
        'export_data',
    ],
    user: [
        // Regular users get no admin permissions
    ],
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
    userPermissions: PermissionName[],
    requiredPermission: PermissionName
): boolean {
    return userPermissions.includes(requiredPermission)
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
    userPermissions: PermissionName[],
    requiredPermissions: PermissionName[]
): boolean {
    return requiredPermissions.some(p => userPermissions.includes(p))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
    userPermissions: PermissionName[],
    requiredPermissions: PermissionName[]
): boolean {
    return requiredPermissions.every(p => userPermissions.includes(p))
}

/**
 * Get permissions for a role
 */
export function getPermissionsForRole(role: 'staff' | 'superuser' | 'user'): PermissionName[] {
    return ROLE_PERMISSIONS[role] || []
}
