import {
  ChangeTypes,
  Position,
  POSITIONS,
} from 'components/playerForms/constants';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CHANGE_COSTS } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalBankBalance,
  InternalBankTransactions,
  InternalPlayerInfo,
} from 'typings/portal-db';

interface PlayerChangeNextApiRequest extends NextApiRequest {
  body: {
    uid: string;
    pid: string;
    type: ChangeTypes;
    oldValue: string | number;
    newValue: string | number;
  };
}

const FORWARD_POSITIONS = ['Center', 'Left Wing', 'Right Wing'];
const DEFENSE_POSITIONS = ['Left Defense', 'Right Defense'];

const getChangeCost = (
  req: PlayerChangeNextApiRequest,
  isSophomoreGoalie: boolean,
) => {
  switch (req.body.type) {
    case 'Name':
      return CHANGE_COSTS.name;
    case 'Position':
      return isSophomoreGoalie ? 0 : CHANGE_COSTS.position;
    case 'Render':
    case 'JerseyNumber':
      return false;
    default:
      return Infinity;
  }
};

const getChangeQuery = (req: PlayerChangeNextApiRequest) => {
  switch (req.body.type) {
    case 'JerseyNumber':
      if (isNaN(Number(req.body.newValue))) {
        return false;
      }
      return [
        'UPDATE playerInfo SET jerseyNumber=? WHERE playerUpdateID=?',
        [req.body.newValue, req.body.pid],
      ];
    default:
      return false;
  }
};

const isNewValueValid = (req: PlayerChangeNextApiRequest) => {
  switch (req.body.type) {
    case 'Name':
    case 'Render':
      return typeof req.body.newValue === 'string';
    case 'JerseyNumber':
      return typeof req.body.newValue === 'number';
    case 'Position':
      return (
        typeof req.body.newValue === 'string' &&
        POSITIONS.includes(req.body.newValue as Position) &&
        req.body.newValue !== 'Goalie'
      );
    default:
      return false;
  }
};

export default async function handler(
  req: PlayerChangeNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, { selfOnly: { pid: req.body.pid } }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const currentSeason = await query<{ season: number }>(
    SQL`SELECT * FROM seasons ORDER BY season DESC LIMIT 1;`,
  );

  const currentPlayer = await query<InternalPlayerInfo & InternalBankBalance>(
    SQL`SELECT * FROM playerInfo
        INNER JOIN bankBalance as bank
        ON playerInfo.userID=bank.uid
        WHERE playerInfo.userID=${req.body.uid}
        AND playerInfo.playerUpdateID=${req.body.pid};`,
  );

  const currentPendingRequest = await query<{ value: boolean }>(
    SQL`SELECT EXISTS(SELECT 1 
        FROM updateEvents 
        WHERE playerUpdateID=${req.body.pid} 
        AND attributeChanged=${req.body.type} 
        AND status='pending') as value;`,
  );

  let isGoalie = false;
  let isSophomoreSeason = false;
  let hasChangedPosition = false;
  let invalidPositionChange = false;
  let hasPendingRequestForType = false;

  if (
    'error' in currentSeason ||
    'error' in currentPlayer ||
    'error' in currentPendingRequest ||
    !currentPlayer.length ||
    !currentSeason.length ||
    !currentPendingRequest.length
  ) {
    res.status(403).end('Invalid request');
    return;
  } else {
    isGoalie = currentPlayer[0].position === 'Goalie';
    isSophomoreSeason = currentPlayer[0].season === currentSeason[0].season;
    hasChangedPosition = Boolean(currentPlayer[0].positionChanged);
    invalidPositionChange =
      req.body.type === 'Position' &&
      (hasChangedPosition ||
        (isGoalie && !isSophomoreSeason) ||
        (FORWARD_POSITIONS.includes(currentPlayer[0].position) &&
          FORWARD_POSITIONS.includes(`${req.body.newValue}`)) ||
        (DEFENSE_POSITIONS.includes(currentPlayer[0].position) &&
          DEFENSE_POSITIONS.includes(`${req.body.newValue}`)));
    hasPendingRequestForType = Boolean(currentPendingRequest[0].value);
  }

  const changeCost = getChangeCost(
    req,
    isGoalie && isSophomoreSeason && !hasChangedPosition,
  );

  const changeQuery = getChangeQuery(req);

  if (
    (typeof changeCost === 'number' &&
      currentPlayer[0].bankBalance < changeCost) ||
    hasPendingRequestForType ||
    invalidPositionChange ||
    !isNewValueValid(req)
  ) {
    res.status(403).end('Invalid change request');
    return;
  }

  const results = await transaction()
    .query(() => {
      if (changeCost > 0) {
        return [
          'INSERT INTO bankTransactions (uid, amount, submitByID, description, status, type) VALUES (?, ?, ?, ?, ?, ?)',
          [
            req.body.uid,
            -changeCost,
            req.cookies.userid,
            req.body.type,
            'completed',
            'change',
          ],
        ];
      } else {
        return null;
      }
    })
    .query(
      SQL`SELECT * FROM bankTransactions WHERE uid=${req.cookies.userid} ORDER BY id DESC LIMIT 1;`,
    )
    .query((r: InternalBankTransactions[]) => {
      if (
        r.length &&
        (changeCost > 0 ||
          (isGoalie && isSophomoreSeason && req.body.type === 'Position')) &&
        req.body.type !== 'JerseyNumber' &&
        req.body.type !== 'Render'
      ) {
        return [
          'INSERT INTO updateEvents (playerUpdateID, attributeChanged, oldValue, newValue, performedByID, bankID, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            req.body.pid,
            req.body.type,
            req.body.oldValue,
            req.body.newValue,
            req.body.uid,
            r[0].id,
            'pending',
          ],
        ];
      } else if (req.body.type === 'Render') {
        return [
          'INSERT INTO updateEvents (playerUpdateID, attributeChanged, oldValue, newValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            req.body.pid,
            req.body.type,
            req.body.oldValue,
            req.body.newValue,
            req.body.uid,
            'pending',
          ],
        ];
      } else {
        return null;
      }
    })
    .query(() => {
      if (changeQuery) {
        return changeQuery;
      } else {
        return null;
      }
    })
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
