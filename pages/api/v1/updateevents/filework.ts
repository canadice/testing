import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { LastWeekUpdates } from 'typings';
import { InternalLastWeekUpdates } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<LastWeekUpdates[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { pid, league } = req.query;

  const response = await query<InternalLastWeekUpdates>(
    SQL`SELECT * FROM lastWeekUpdates WHERE 1 `
      .append(pid !== undefined ? SQL`AND playerUpdateID=${pid} ` : '')
      .append(league !== undefined ? SQL`AND attributeChanged=${league} ` : ''),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json(response);
};
