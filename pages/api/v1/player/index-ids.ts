import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { IndexPlayerID } from 'typings';
import { InternalIndexPlayerID } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<IndexPlayerID[]>,
): Promise<void> => {
  await use(req, res, cors);

  if (!req.query.pid) {
    res.status(400).end('Invalid request');
    return;
  }

  const response = await query<InternalIndexPlayerID>(
    SQL`
    SELECT * FROM indexPlayerID
    WHERE indexPlayerID.playerUpdateID IN (${req.query.pid});`,
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json(response);
};
