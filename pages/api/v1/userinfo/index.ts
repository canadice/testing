import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalUserInfo } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  const { uid } = req.query;

  const response = await query<InternalUserInfo>(
    SQL`SELECT * FROM userInfo WHERE userID!=0`
      .append(uid != null ? ` AND userID=${uid}` : '')
      .append(' ORDER BY username ASC;'),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json(response);
};
