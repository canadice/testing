import { userGroups as UserGroups } from './userGroups';

export default {
  roleNameByUserGroup: {
    [UserGroups.SHL_COMMISSIONER]: 'Commissioner',
    [UserGroups.SMJHL_COMMISSIONER]: 'Commissioner',
    [UserGroups.HEAD_UPDATER]: 'Head Updater',
    [UserGroups.UPDATER]: 'Updater',
    [UserGroups.SHL_GM]: 'General Manager',
    [UserGroups.SMJHL_GM]: 'General Manager',
  } as const,
  defaultUserRole: 'User' as const,
  userIDCookieName: 'userid',
  userRoleCookieName: 'role',
};
