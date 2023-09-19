import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalSkaterUpdateScale } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  const response = await query<InternalSkaterUpdateScale>(
    SQL`SELECT * FROM lookup_skaterUpdateScale;`,
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed: Record<
    string,
    Omit<InternalSkaterUpdateScale, 'attributeValue'>
  > = {};

  response.map(
    (data) =>
      (parsed[data.attributeValue] = {
        pointCost: data.pointCost,
        totalCost: data.totalCost,
        stamCost: data.stamCost,
      }),
  );

  res.status(200).json(parsed);
};
