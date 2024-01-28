import { COUNTRIES, Country } from 'components/playerForms/constants';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_ASSIGN_PLAYER_IIHF_NATION } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalPlayerInfo } from 'typings/portal-db';

interface ExtendedRequest extends NextApiRequest {
  body: {
    pid: string;
    nation?: string;
  };
}

export default async function handler(
  req: ExtendedRequest,
  res: NextApiResponse,
) {
  if (
    !(await checkUserAuthorization(req, {
      validRoles: CAN_ASSIGN_PLAYER_IIHF_NATION,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const player = await query<InternalPlayerInfo>(
    SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${req.body.pid};`,
  );

  if ('error' in player) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (
    !player.length ||
    (req.body.nation !== undefined &&
      !COUNTRIES.includes(req.body.nation as Country))
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  const iihfNationQuery =
    req.body.nation === undefined
      ? SQL`UPDATE playerInfo SET iihfNation=NULL WHERE playerUpdateID=${req.body.pid};`
      : SQL`UPDATE playerInfo SET iihfNation=${req.body.nation} WHERE playerUpdateID=${req.body.pid};`;

  const results = await transaction()
    .query(iihfNationQuery)
    .query(() => [
      'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.body.pid,
        'iihfNation',
        req.body.nation ?? 'NULL',
        player[0].iihfNation ?? 'NULL',
        req.cookies.userid,
        'approved',
      ],
    ])
    .rollback((_e: any) => {})
    .commit();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
