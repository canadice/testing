import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { GeneralManager } from 'typings';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  const { uid, league } = req.query;

  const response = await query<GeneralManager>(
    SQL`SELECT gm.leagueID, gm.teamID, gm.gmID, gm.cogmID, gmUser.username AS gmUsername, cogmUser.username AS cogmUsername
    FROM generalManagers gm
    INNER JOIN userInfo gmUser ON gmUser.userID = gm.gmID
    LEFT JOIN userInfo cogmUser ON cogmUser.userID = gm.cogmID`
      .append(uid != null ? ` WHERE gmID=${uid} OR cogmID=${uid}` : '')
      .append(league != null ? ` WHERE leagueID=${league}` : ''),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json(response);
};
