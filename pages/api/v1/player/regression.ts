import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { Regression } from 'typings';
import {
  InternalPlayerInfo,
  InternalRegressionScale,
  InternalTPECounts,
  InternalUserInfo,
} from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Regression[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { pid, season } = req.query;

  const response = await query<
    Pick<InternalPlayerInfo, 'playerUpdateID' | 'name' | 'season'> &
      Pick<InternalTPECounts, 'totalTPE'> &
      Pick<InternalRegressionScale, 'regressionPct'> &
      InternalUserInfo & {
        regressionTPE: number;
        newTPE: number;
      }
  >(
    SQL`
      SELECT
        playerInfo.playerUpdateID,
        playerInfo.name,
        playerInfo.season,
        userInfo.*, 
        TPECounts.totalTPE,
        lookup_regression.regressionPct, 
        CEIL(TPECounts.totalTPE  * (lookup_regression.regressionPct / 100)) AS 'regressionTPE', 
        TPECounts.totalTPE - CEIL((TPECounts.totalTPE * (lookup_regression.regressionPct / 100))) AS 'newTPE' 
      FROM playerInfo 
      INNER JOIN userInfo on playerInfo.userID = userInfo.userID
      INNER JOIN lookup_regression ON lookup_regression.totalSeasons = ${season} - playerInfo.season
      INNER JOIN TPECounts ON TPECounts.playerUpdateID = playerInfo.playerUpdateID WHERE playerInfo.status='active' `.append(
      pid != null ? SQL`AND playerInfo.playerUpdateID=${pid} ` : '',
    ),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed = response.map((data) => ({
    uid: data.userID,
    username: data.username,
    pid: data.playerUpdateID,
    name: data.name,
    draftSeason: data.season,
    oldTPE: data.totalTPE,
    regressionPct: data.regressionPct,
    regressionTPE: data.regressionTPE,
    newTPE: data.newTPE,
  }));

  res.status(200).json(parsed);
};
