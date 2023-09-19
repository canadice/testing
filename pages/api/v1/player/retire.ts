import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { endTransaction, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalPlayerInfo,
  InternalTPECounts,
  InternalUpdateEvents,
} from 'typings/portal-db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      selfOnly: { pid: req.body.playerUpdateID },
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  let currentStatus: string;
  let alreadyUnretired: boolean;
  let removedTPE = 0;

  const results = await transaction()
    .query(
      SQL`SELECT * FROM updateEvents WHERE playerUpdateID=${req.body.playerUpdateID};`,
    )
    .query((r: InternalUpdateEvents[]) => {
      if (r.length > 0) {
        alreadyUnretired = r.some((update) => update.oldValue === 'retired');
      }
      return null;
    })
    .query(
      SQL`SELECT * FROM playerInfo
          INNER JOIN TPECounts ON playerInfo.playerUpdateID = TPECounts.playerUpdateID
          WHERE playerInfo.playerUpdateID=${req.body.playerUpdateID};`,
    )
    .query((r: Array<InternalPlayerInfo & InternalTPECounts>) => {
      if (r.length > 0) {
        currentStatus = r[0].status;
        if (currentStatus === 'active') {
          return [
            "UPDATE playerInfo SET status='retired', retirementDate=? WHERE playerUpdateID=?;",
            [new Date(), req.body.playerUpdateID],
          ];
        } else if (currentStatus === 'retired') {
          if (!alreadyUnretired) {
            removedTPE = Number((r[0].totalTPE * 0.15).toFixed(0));
            return [
              "UPDATE playerInfo SET status='active' WHERE playerUpdateID=?;",
              [req.body.playerUpdateID],
            ];
          }
        }
      }
    })
    .query(() => {
      if (currentStatus === 'retired' && !alreadyUnretired) {
        return [
          'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription) VALUES (?, ?, ?, ?, ?)',
          [
            req.cookies.userid,
            req.body.playerUpdateID,
            -removedTPE,
            'Unretire',
            '15% TPE Penalty for Unretiring',
          ],
        ];
      } else {
        return null;
      }
    })
    .query(() => {
      return [
        'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.body.playerUpdateID,
          'status',
          currentStatus === 'retired' ? 'active' : 'retired',
          currentStatus === 'retired' ? 'retired' : 'active',
          req.cookies.userid,
          'NotRequired',
        ],
      ];
    })
    .rollback((_e: any) => {})
    .commit();

  await endTransaction();

  if (!results.length) {
    res.status(400).end('Invalid request');
    return;
  }

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
