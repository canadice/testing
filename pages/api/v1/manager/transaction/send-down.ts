import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import {
  CAN_HANDLE_TEAM_TRANSACTIONS,
  SMJHL_ROOKIE_CAP,
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
  InternalUpdateEvents,
} from 'typings/portal-db';

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

  const event = await query<InternalUpdateEvents>(
    SQL`SELECT * FROM updateEvents 
        WHERE attributeChanged='currentTeamID' 
        AND playerUpdateID=${req.body.pid} 
        ORDER BY eventID DESC LIMIT 1;`,
  );

  if (
    'error' in manager ||
    'error' in player ||
    'error' in season ||
    'error' in event
  ) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (
    !manager.length ||
    !player.length ||
    !season.length ||
    !event.length ||
    player[0].currentTeamID !== manager[0].teamID ||
    player[0].currentLeague !== 'SHL' ||
    player[0].season === null ||
    (player[0].season === season[0].season - 1 &&
      player[0].appliedTPE > SMJHL_ROOKIE_CAP) ||
    (player[0].season >= season[0].season - 3 &&
      player[0].appliedTPE > SMJHL_SOPHOMORE_CAP)
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  const [formerTeamID] = event[0].oldValue.split('|');

  const changeQuery = () => {
    if (formerTeamID !== 'NULL') {
      return SQL`UPDATE playerInfo SET currentTeamID=${formerTeamID}, currentLeague='SMJHL' WHERE playerUpdateID=${req.body.pid};`;
    } else {
      return SQL`UPDATE playerInfo SET currentTeamID=NULL, currentLeague='SMJHL' WHERE playerUpdateID=${req.body.pid};`;
    }
  };

  const results = await transaction()
    .query(changeQuery())
    .query(() => [
      'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES ?',
      [
        [
          [
            req.body.pid,
            'currentTeamID',
            event[0].oldValue,
            `${player[0].currentTeamID}|${req.body.oldName}`,
            req.cookies.userid,
            'approved',
          ],
          [
            req.body.pid,
            'currentLeague',
            'SMJHL',
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
