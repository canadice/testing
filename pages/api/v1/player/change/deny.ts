import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_APPROVE_PLAYERS } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalBankTransactions,
  InternalUpdateEvents,
} from 'typings/portal-db';

interface DenyNextApiRequest extends NextApiRequest {
  body: {
    eventID: string;
  };
}

export default async function handler(
  req: DenyNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      validRoles: CAN_APPROVE_PLAYERS,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const updateEvents = await query<InternalUpdateEvents>(
    SQL`SELECT * FROM updateEvents WHERE eventID=${req.body.eventID} AND status='pending';`,
  );

  if ('error' in updateEvents || !updateEvents.length) {
    res.status(500).end('Server connection failed');
    return;
  }

  const playerStatusChange = () => {
    if (updateEvents[0].attributeChanged === 'status') {
      return SQL`UPDATE playerInfo SET status='denied' WHERE playerUpdateID=${updateEvents[0].playerUpdateID};`;
    }
    return SQL`SELECT * FROM updateEvents WHERE eventID=${req.body.eventID} AND status='pending';`;
  };

  const results =
    updateEvents[0].bankID !== null
      ? await transaction()
          .query(
            SQL`SELECT * FROM bankTransactions WHERE id=${updateEvents[0].bankID};`,
          )
          .query((r: InternalBankTransactions[]) => {
            if (r.length === 1) {
              return [
                'UPDATE bankTransactions SET status=? WHERE id=?;',
                ['reversed', updateEvents[0].bankID],
              ];
            } else {
              throw new Error('error');
            }
          })
          .query(() => [
            'UPDATE updateEvents SET status=? WHERE eventID=?;',
            ['denied', req.body.eventID],
          ])
          .rollback((_e: any) => {})
          .commit()
      : await transaction()
          .query(playerStatusChange())
          .query(() => [
            'UPDATE updateEvents SET status=? WHERE eventID=?;',
            ['denied', req.body.eventID],
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
