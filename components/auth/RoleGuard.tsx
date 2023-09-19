import { useSession } from '../../contexts/AuthContext';
import { useCookie } from '../../hooks/useCookie';
import { usePermissions } from '../../hooks/usePermissions';
import { userGroups } from '../../lib/userGroups';
import React from 'react';

// Similar to PermissionGuard.tsx, this function returns components based on the user's roles instead of permissions.
export const RoleGuard = ({
  userRoles,
  children,
  fallback,
}: {
  userRoles:
  | keyof Readonly<typeof userGroups>
  | (keyof Readonly<typeof userGroups>)[];
  children: React.ReactNode;
  fallback?: React.ReactElement | null;
}) => {
  const { loggedIn } = useSession();
  // Retrieves user groups from the user
  const { groups } = usePermissions();
  const [sudo] = useCookie<'true' | 'false'>('sudo', 'false');

  if (!loggedIn) {
    return null;
  }

  if (sudo === 'true' && groups?.includes('PORTAL_MANAGEMENT')) {
    return <>{children}</>;
  }

  if (typeof userRoles === 'string') {
    return groups?.includes(userRoles) ? <>{children}</> : fallback ?? null;
  }

  if (userRoles.some((role) => groups?.includes(role))) {
    return <>{children}</>;
  }

  return fallback ?? null;
};
