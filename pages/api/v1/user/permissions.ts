import Cors from 'cors';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { userQuery } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  if (req.method !== 'GET') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!(await checkUserAuthorization(req))) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const response = await userQuery<{
    uid: number;
    usergroup: number;
    additionalgroups: string;
  }>(SQL`
    SELECT uid, usergroup, additionalgroups
    FROM mybb_users
    WHERE uid=${req.cookies.userid}
  `);

  if ('error' in response || response.length === 0) {
    res.status(500).end('Server connection failed');
    return;
  }

  const [user] = response;

  res.status(200).json({
    uid: user.uid,
    groups: [
      user.usergroup,
      ...user.additionalgroups
        .split(',')
        .filter(Boolean)
        .map((group) => parseInt(group)),
    ],
  });
};
