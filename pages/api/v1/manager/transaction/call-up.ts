import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_HANDLE_TEAM_TRANSACTIONS } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalGeneralManagers,
  InternalPlayerInfo,
  InternalSeasons,
  InternalTPECounts,
} from 'typings/portal-db';

interface ExtendedRequest extends NextApiRequest {
  body: {
    pid: string;
    oldName: string;
    newName: string;
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

  const season = await query<InternalSeasons>(
    SQL`SELECT season FROM seasons ORDER BY season DESC LIMIT 1;`,
  );

  const manager = await query<InternalGeneralManagers>(
    SQL`SELECT * FROM generalManagers WHERE gmID=${req.cookies.userid} OR cogmID=${req.cookies.userid};`,
  );

  const player = await query<InternalPlayerInfo & InternalTPECounts>(
    SQL`SELECT * FROM playerInfo
        INNER JOIN TPECounts as counts
        ON playerInfo.playerUpdateID=counts.playerUpdateID
        WHERE playerInfo.playerUpdateID=${req.body.pid};`,
  );

  if ('error' in manager || 'error' in player || 'error' in season) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (
    !manager.length ||
    !player.length ||
    !season.length ||
    player[0].currentLeague !== 'SMJHL' ||
    player[0].season === null ||
    player[0].shlRightsTeamID !== manager[0].teamID
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  const results = await transaction()
    .query(
      SQL`UPDATE playerInfo SET currentTeamID=${manager[0].teamID}, currentLeague='SHL' WHERE playerUpdateID=${req.body.pid};`,
    )
    .query(() => [
      'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES ?',
      [
        [
          [
            req.body.pid,
            'currentTeamID',
            `${manager[0].teamID}|${req.body.newName}`,
            player[0].currentTeamID && req.body.oldName
              ? `${player[0].currentTeamID}|${req.body.oldName}`
              : 'NULL',
            req.cookies.userid,
            'approved',
          ],
          [
            req.body.pid,
            'currentLeague',
            'SHL',
            player[0].currentLeague,
            req.cookies.userid,
            'approved',
          ],
        ],
      ],
    ])
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
