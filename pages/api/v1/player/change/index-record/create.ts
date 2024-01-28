import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_MANAGE_PLAYER_INDEX_IDS } from 'lib/constants';
import { endTransaction, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import { IndexPlayerID } from 'typings';
import { isValidID } from 'utils/isValidID';

interface IndexRecordNextApiRequest extends NextApiRequest {
  body: {
    indexRecord: IndexPlayerID;
  };
}

export default async function handler(
  req: IndexRecordNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !req.body.indexRecord ||
    !isValidID(req.body.indexRecord.playerUpdateID) ||
    !isValidID(req.body.indexRecord.leagueID) ||
    !isValidID(req.body.indexRecord.indexID) ||
    !req.body.indexRecord.startSeason
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      validRoles: CAN_MANAGE_PLAYER_INDEX_IDS,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const results = await transaction()
    .query(() => [
      'INSERT INTO indexPlayerID (playerUpdateID, leagueID, indexID, startSeason) VALUES (?,?,?,?)',
      [
        req.body.indexRecord.playerUpdateID,
        req.body.indexRecord.leagueID,
        req.body.indexRecord.indexID,
        req.body.indexRecord.startSeason,
      ],
    ])
    .rollback((_e: any) => {})
    .commit();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!results.length) {
    res.status(400).end('Invalid request');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
