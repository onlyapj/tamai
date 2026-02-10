import React from 'react';
import { hasPermission } from './rolePermissions';

// Component to conditionally render based on user role and required permission
export default function RoleGuard({ userRole, permission, children, fallback = null }) {
  if (hasPermission(userRole, permission)) {
    return children;
  }
  return fallback;
}