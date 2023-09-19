import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalSeasons } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  const response = await query<InternalSeasons>(
    SQL`SELECT * FROM seasons ORDER BY season DESC LIMIT 1;`,
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!response.length) {
    res.status(400).end('Invalid request');
    return;
  }

  res.status(200).json(response[0]);
};
