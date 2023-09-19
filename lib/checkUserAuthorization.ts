import * as jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import SQL from 'sql-template-strings';

import { userQuery, query } from './db';
import { userGroups } from './userGroups';

export const checkUserAuthorization = async (
  req: NextApiRequest,
  options?: {
    validRoles?:
      | keyof Readonly<typeof userGroups>
      | (keyof Readonly<typeof userGroups>)[];
    selfOnly?: { pid: string | number };
  },
): Promise<boolean> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7, authHeader.length);

  try {
    const decodedToken = jwt.verify(token, process.env.SECRET ?? '');

    if (typeof decodedToken === 'string' || !('userid' in decodedToken)) {
      return false;
    }

    const updatingOwnRecord = Boolean(options?.selfOnly);

    const canUpdateOwn = options?.selfOnly?.pid
      ? await checkUserIsUpdatingOwn(
          decodedToken.userid.toString(),
          String(req.cookies.userid),
          String(options.selfOnly.pid),
        )
      : false;

    if (!canUpdateOwn && options?.validRoles) {
      const roleQuery = await userQuery<{
        uid: number;
        usergroup: number;
        additionalgroups: string;
      }>(SQL`
        SELECT uid, usergroup, additionalgroups
        FROM mybb_users
        WHERE uid=${decodedToken.userid}
      `);

      if ('error' in roleQuery || roleQuery.length === 0) {
        return false;
      }

      const [queryUser] = roleQuery;
      const groups = [
        queryUser.usergroup,
        ...queryUser.additionalgroups
          .split(',')
          .filter(Boolean)
          .map((group) => parseInt(group)),
      ];

      if (
        'sudo' in req.cookies &&
        req.cookies.sudo === 'true' &&
        groups.includes(userGroups.PORTAL_MANAGEMENT)
      ) {
        return req.cookies.userid === decodedToken.userid.toString();
      }

      return (
        req.cookies.userid === decodedToken.userid.toString() &&
        groups.some((group) => {
          if (typeof options.validRoles === 'string') {
            return userGroups[options.validRoles] === group;
          }
          return options.validRoles?.some((role) => userGroups[role] === group);
        })
      );
    }

    return updatingOwnRecord
      ? canUpdateOwn
      : req.cookies.userid === decodedToken.userid.toString();
  } catch (err) {
    return false;
  }
};

const checkUserIsUpdatingOwn = async (
  decodedTokenId: string,
  cookieId: string,
  playerId: string,
): Promise<boolean> => {
  const playerQuery = await query<{
    userID: string;
    playerUpdateID: string;
  }>(SQL`
      SELECT userID, playerUpdateID
      FROM playerInfo
      WHERE userID=${decodedTokenId}
      AND playerUpdateID=${playerId}
    `);

  if ('error' in playerQuery || playerQuery.length === 0) {
    return false;
  }

  return (
    String(playerQuery[0].userID) === String(decodedTokenId) &&
    String(playerQuery[0].userID) === String(cookieId) &&
    String(playerQuery[0].playerUpdateID) === String(playerId)
  );
};
