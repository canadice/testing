import { userGroups } from 'lib/userGroups';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { useCookie } from './useCookie';
import { usePermissions, Permissions } from './usePermissions';

export const useRedirectIfUnauthed = (
  path: string,
  options:
    | {
        roles:
          | keyof Readonly<typeof userGroups>
          | (keyof Readonly<typeof userGroups>)[];
      }
    | {
        permissions: keyof Permissions | (keyof Permissions)[];
      },
) => {
  const router = useRouter();
  const { loading, groups, permissions } = usePermissions();
  const [sudo] = useCookie<'true' | 'false'>('sudo', 'false');

  useEffect(() => {
    if (sudo === 'true' && groups?.includes('PORTAL_MANAGEMENT')) {
      return;
    }

    if (
      !loading && // if roles exist check to see if we don't match any roles
      (('roles' in options &&
        ((typeof options.roles === 'string' &&
          !groups?.includes(options.roles)) ||
          (typeof options.roles !== 'string' &&
            !options.roles.some((role) => groups?.includes(role))))) ||
        ('permissions' in options &&
          ((typeof options.permissions === 'string' &&
            !permissions[options.permissions]) ||
            (typeof options.permissions !== 'string' &&
              !options.permissions.some(
                (permission) => permissions[permission],
              )))))
    ) {
      router.replace(path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);
};
