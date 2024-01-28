import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { DraftInfo } from 'typings';
import { InternalDraftInfo } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<DraftInfo[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { pid, uid, season, teamID, leagueID } = req.query;

  if (teamID && !leagueID) {
    res
      .status(400)
      .end('Invalid request: leagueID required when querying by teamID');
    return;
  }

  const response = await query<InternalDraftInfo>(
    SQL`SELECT * FROM draftInfo WHERE 1 `
      .append(
        pid !== undefined ? SQL`AND draftInfo.playerUpdateID=${pid} ` : '',
      )
      .append(uid !== undefined ? SQL`AND draftInfo.uid=${uid} ` : '')
      .append(
        season !== undefined ? SQL`AND draftInfo.seasonID=${season} ` : '',
      )
      .append(teamID !== undefined ? SQL`AND draftInfo.teamID=${teamID} ` : '')
      .append(
        leagueID !== undefined ? SQL`AND draftInfo.leagueID=${leagueID} ` : '',
      )
      .append(`ORDER BY seasonID, round, draftNumber ASC`),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed: DraftInfo[] = response.map((data) => ({
    playerUpdateID: data.playerUpdateID,
    userID: data.uid,
    leagueID: data.leagueID,
    seasonID: data.seasonID,
    teamID: data.teamID,
    round: data.round,
    draftNumber: data.draftNumber,
    playerName: data.name,
  }));

  res.status(200).json(parsed);
};
