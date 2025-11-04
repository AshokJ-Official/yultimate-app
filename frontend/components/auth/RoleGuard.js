'use client';

import { useAuth } from '@/lib/auth-context';

export default function RoleGuard({ 
  children, 
  roles = [], 
  permission = null, 
  accessLevel = null,
  fallback = null 
}) {
  const { user, hasRole, hasPermission, canAccess } = useAuth();

  if (!user) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please log in to access this content.</p>
        </div>
      </div>
    );
  }

  // Check role-based access
  if (roles.length > 0 && !hasRole(roles)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to view this content.</p>
        </div>
      </div>
    );
  }

  // Check permission-based access
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Insufficient Permissions</h2>
          <p className="text-gray-600">You don't have the required permissions.</p>
        </div>
      </div>
    );
  }

  // Check access level
  if (accessLevel && !canAccess(accessLevel)) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Level Insufficient</h2>
          <p className="text-gray-600">Your access level is not sufficient for this content.</p>
        </div>
      </div>
    );
  }

  return children;
}