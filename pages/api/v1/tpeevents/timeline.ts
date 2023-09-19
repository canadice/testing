import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { TPETimeline } from 'typings';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TPETimeline[]>,
): Promise<void> => {
  await use(req, res, cors);

  if (!req.query.pid) {
    res.status(400).end('Invalid request');
    return;
  }

  const response = await query<TPETimeline>(
    SQL`
    SELECT 
    p.name, t.taskDate, SUM(t2.TPEChange) as totalTPE
    FROM TPEEvents t LEFT JOIN TPEEvents t2 ON t.playerUpdateID = t2.playerUpdateID AND t.taskDate >= t2.taskDate
    INNER JOIN playerInfo p on p.playerUpdateID = t.playerUpdateID
    WHERE t.playerUpdateID IN (${req.query.pid}) 
    GROUP BY t.taskDate, t.playerUpdateID  
    ORDER BY t.taskDate ASC`,
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json(response);
};
