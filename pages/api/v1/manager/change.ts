import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import {
  CAN_ASSIGN_SHL_GM_ROLE,
  CAN_ASSIGN_SMJHL_GM_ROLE,
} from 'lib/constants';
import { query } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';

interface PlayerChangeNextApiRequest extends NextApiRequest {
  body: {
    leagueID: number;
    teamID: number;
    userID: number;
    type: 'GM' | 'COGM' | 'DELETE';
  };
}

export default async function handler(
  req: PlayerChangeNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      validRoles: [...CAN_ASSIGN_SHL_GM_ROLE, ...CAN_ASSIGN_SMJHL_GM_ROLE],
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const results =
    req.body.type === 'DELETE'
      ? await query(
          SQL`UPDATE generalManagers SET cogmID=NULL WHERE leagueID=${req.body.leagueID} AND teamID=${req.body.teamID};`,
        )
      : req.body.type === 'GM'
      ? await query(SQL`INSERT INTO generalManagers (leagueID, teamID, gmID)
      VALUES (${req.body.leagueID},${req.body.teamID},${req.body.userID})
      ON DUPLICATE KEY UPDATE gmID=${req.body.userID};`)
      : await query(SQL`INSERT INTO generalManagers (leagueID, teamID, gmID, cogmID)
      VALUES (${req.body.leagueID},${req.body.teamID},0,${req.body.userID})
      ON DUPLICATE KEY UPDATE cogmID=${req.body.userID};`);

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
