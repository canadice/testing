import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import {
  CAN_HANDLE_TEAM_TRANSACTIONS,
  SMJHL_SOPHOMORE_CAP,
} from 'lib/constants';
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
    (manager[0].leagueID === 1 && player[0].appliedTPE > SMJHL_SOPHOMORE_CAP) ||
    player[0].currentTeamID !== null
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  const isSHLTransaction = manager[0].leagueID === 0;

  const results = await transaction()
    .query(
      SQL`UPDATE playerInfo SET currentTeamID=${manager[0].teamID}`
        .append(
          isSHLTransaction
            ? SQL`, currentLeague='SHL'`
            : SQL`, currentLeague='SMJHL'`,
        )
        .append(SQL` WHERE playerUpdateID=${req.body.pid};`),
    )
    .query(() => [
      'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.body.pid,
        'currentTeamID',
        `${manager[0].teamID}|${req.body.newName}`,
        'NULL',
        req.cookies.userid,
        'approved',
      ],
    ])
    .query(() => {
      if ((isSHLTransaction ? 'SHL' : 'SMJHL') !== player[0].currentLeague) {
        return [
          'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            req.body.pid,
            'currentLeague',
            isSHLTransaction ? 'SHL' : 'SMJHL',
            player[0].currentLeague ?? 'NULL',
            req.cookies.userid,
            'approved',
          ],
        ];
      } else {
        return null;
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
