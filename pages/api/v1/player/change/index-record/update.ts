import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_MANAGE_PLAYER_INDEX_IDS } from 'lib/constants';
import { endTransaction, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { IndexPlayerID } from 'typings';
import { isValidID } from 'utils/isValidID';

interface IndexRecordNextApiRequest extends NextApiRequest {
  body: {
    existingRecord: IndexPlayerID;
    updatedRecord: IndexPlayerID;
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
    !req.body.existingRecord ||
    !isValidID(req.body.existingRecord.playerUpdateID) ||
    !isValidID(req.body.existingRecord.leagueID) ||
    !isValidID(req.body.existingRecord.indexID) ||
    !req.body.existingRecord.startSeason ||
    !req.body.updatedRecord ||
    !isValidID(req.body.updatedRecord.playerUpdateID) ||
    !isValidID(req.body.updatedRecord.leagueID) ||
    !isValidID(req.body.updatedRecord.indexID) ||
    !req.body.updatedRecord.startSeason
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
    .query(
      SQL`UPDATE indexPlayerID SET 
                indexID=${req.body.updatedRecord.indexID}, 
                leagueID=${req.body.updatedRecord.leagueID}, 
                startSeason=${req.body.updatedRecord.startSeason} 
            WHERE playerUpdateID=${req.body.existingRecord.playerUpdateID} 
                AND leagueID=${req.body.existingRecord.leagueID} 
                AND indexID=${req.body.existingRecord.indexID} 
                AND startSeason=${req.body.existingRecord.startSeason};`,
    )
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
