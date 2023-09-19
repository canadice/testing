import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_HANDLE_TEAM_TRANSACTIONS } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalGeneralManagers, InternalPlayerInfo } from 'typings/portal-db';

interface ExtendedRequest extends NextApiRequest {
  body: {
    pid: string;
    oldName: string;
  };
}

export default async function handler(
  req: ExtendedRequest,
  res: NextApiResponse,
) {
  if (
    !(await checkUserAuthorization(req, {
      validRoles: CAN_HANDLE_TEAM_TRANSACTIONS,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const manager = await query<InternalGeneralManagers>(
    SQL`SELECT * FROM generalManagers WHERE gmID=${req.cookies.userid} OR cogmID=${req.cookies.userid};`,
  );

  const player = await query<InternalPlayerInfo>(
    SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${req.body.pid};`,
  );

  if ('error' in manager || 'error' in player) {
    res.status(500).end('Server connection failed');
    return;
  }

  const isSHLTransaction = manager[0].leagueID === 0;

  if (
    !manager.length ||
    !player.length ||
    (isSHLTransaction
      ? player[0].currentLeague === 'SHL'
        ? player[0].currentTeamID !== manager[0].teamID
        : player[0].shlRightsTeamID !== manager[0].teamID
      : player[0].currentTeamID !== manager[0].teamID)
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  const updateQuery = isSHLTransaction
    ? player[0].currentLeague === 'SHL'
      ? SQL`UPDATE playerInfo SET currentTeamID=NULL WHERE playerUpdateID=${req.body.pid};`
      : SQL`UPDATE playerInfo SET shlRightsTeamID=NULL WHERE playerUpdateID=${req.body.pid};`
    : SQL`UPDATE playerInfo SET currentTeamID=NULL WHERE playerUpdateID=${req.body.pid};`;

  const results = await transaction()
    .query(updateQuery)
    .query(() => {
      if (isSHLTransaction) {
        if (player[0].currentLeague === 'SHL') {
          return [
            'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
            [
              req.body.pid,
              'currentTeamID',
              'NULL',
              `${player[0].currentTeamID}|${req.body.oldName}`,
              req.cookies.userid,
              'approved',
            ],
          ];
        } else {
          return [
            'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
            [
              req.body.pid,
              'shlRightsTeamID',
              'NULL',
              `${player[0].shlRightsTeamID}|${req.body.oldName}`,
              req.cookies.userid,
              'approved',
            ],
          ];
        }
      } else {
        return [
          'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            req.body.pid,
            'currentTeamID',
            'NULL',
            player[0].currentTeamID,
            req.cookies.userid,
            'approved',
          ],
        ];
      }
    })
    .rollback((_e: any) => {})
    .commit();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
