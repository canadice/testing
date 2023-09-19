import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalGoalieUpdateScale } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  const response = await query<InternalGoalieUpdateScale>(
    SQL`SELECT * FROM lookup_goalieUpdateScale;`,
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed: Record<
    string,
    Omit<InternalGoalieUpdateScale, 'attributeValue'>
  > = {};

  response.map(
    (data) =>
      (parsed[data.attributeValue] = {
        pointCost: data.pointCost,
        totalCost: data.totalCost,
      }),
  );

  res.status(200).json(parsed);
};
