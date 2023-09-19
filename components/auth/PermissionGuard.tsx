import { useSession } from '../../contexts/AuthContext';
import { useCookie } from '../../hooks/useCookie';
import { usePermissions, Permissions } from '../../hooks/usePermissions';
import React from 'react';

// Function that would render different components based on the user's permissions
export const PermissionGuard = ({
  // The user permissions given 
  userPermissions,
  // Children includes the React components that will render based on the user permissions
  children,
  // Optional React component that will render if the user does not have the required permissions
  fallback,
}: {
  userPermissions: keyof Permissions | (keyof Permissions)[];
  children: React.ReactNode;
  fallback?: React.ReactElement | null;
}) => {
  // Retrieves the user's session
  const { loggedIn } = useSession();
  // Retrieves the user permissions
  const { permissions, groups } = usePermissions();
  // Gets value of the cookie called sudo
  const [sudo] = useCookie<'true' | 'false'>('sudo', 'false');

  if (!loggedIn) {
    return null;
  }

  if (sudo === 'true' && groups?.includes('PORTAL_MANAGEMENT')) {
    return <>{children}</>;
  }

  if (typeof userPermissions === 'string') {
    return permissions[userPermissions] ? <>{children}</> : fallback ?? null;
  }

  if (userPermissions.some((permission) => permissions[permission])) {
    return <>{children}</>;
  }

  // If none of the user permissions are met earlier the function returns null
  return fallback ?? null;
};
