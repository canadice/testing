import { useSession } from 'contexts/AuthContext';
import { useCookie } from 'hooks/useCookie';
import { usePermissions, Permissions } from 'hooks/usePermissions';
import React from 'react';

export const PermissionGuard = ({
  userPermissions,
  children,
  fallback,
}: {
  userPermissions: keyof Permissions | (keyof Permissions)[];
  children: React.ReactNode;
  fallback?: React.ReactElement | null;
}) => {
  const { loggedIn } = useSession();
  const { permissions, groups } = usePermissions();
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

  return fallback ?? null;
};
