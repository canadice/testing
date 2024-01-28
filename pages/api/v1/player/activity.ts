import { ActivityTypes } from 'components/playerForms/constants';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import {
  COACHING_COSTS,
  TRAINING_COSTS,
  COACHING_MAX,
  MAXIMUM_BANK_OVERDRAFT,
} from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalBankBalance,
  InternalPlayerInfo,
  InternalWeeklyCounts,
} from 'typings/portal-db';
import { assertUnreachable } from 'utils/assertUnreachable';

interface PlayerEventNextApiRequest extends NextApiRequest {
  body: {
    pid: string;
    type: ActivityTypes;
    amount: number;
  };
}

const getActivityCost = (
  isRookie: boolean,
  type: ActivityTypes,
  amount: number,
) => {
  switch (type) {
    case 'Activity Check':
    case 'Training Camp':
      return 0;
    case 'Coaching':
      return isRookie
        ? COACHING_COSTS.rookie * amount
        : COACHING_COSTS.standard * amount;
    case 'Training':
      return isRookie
        ? TRAINING_COSTS.rookie[amount as keyof typeof TRAINING_COSTS.rookie]
        : TRAINING_COSTS.standard[
            amount as keyof typeof TRAINING_COSTS.standard
          ];
    default:
      assertUnreachable(type as never);
      return Infinity;
  }
};

const getTrainingCampTPE = (playerSeason: number, season: number) => {
  if (playerSeason - 1 === season) {
    return 14;
  }
  if (playerSeason === season) {
    return 24;
  }
  if (playerSeason + 1 === season) {
    return 18;
  }
  if (playerSeason + 2 === season || playerSeason + 3 === season) {
    return 12;
  }
  return 6;
};

const checkHasDoneActivity = (
  isRookie: boolean,
  player: InternalPlayerInfo & InternalBankBalance & InternalWeeklyCounts,
  type: ActivityTypes,
  amount: number,
) => {
  switch (type) {
    case 'Activity Check':
      return player.weeklyActivityCheck > 0;
    case 'Training Camp':
      return player.teamTrainingCamp > 0;
    case 'Training':
      return player.weeklyTraining > 0;
    case 'Coaching':
      return (
        player.coachingPurchased + amount >
        (isRookie ? COACHING_MAX.rookie : COACHING_MAX.standard)
      );
    default:
      assertUnreachable(type as never);
      return true;
  }
};

const getTPEEventsQuery = ({
  req,
  bankID,
  trainingCampTPE,
}: {
  req: PlayerEventNextApiRequest;
  bankID?: number;
  trainingCampTPE?: number;
}) => {
  switch (req.body.type) {
    case 'Activity Check':
      return [
        'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription) VALUES (?, ?, ?, ?, ?)',
        [
          req.cookies.userid,
          req.body.pid,
          2,
          'activity check',
          'Weekly Activity Check: +2',
        ],
      ];
    case 'Training Camp':
      return [
        'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription) VALUES (?, ?, ?, ?, ?)',
        [
          req.cookies.userid,
          req.body.pid,
          trainingCampTPE,
          'training camp',
          `Team Training Camp: +${trainingCampTPE}`,
        ],
      ];
    case 'Training':
      return [
        'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription, bankID) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.cookies.userid,
          req.body.pid,
          req.body.amount,
          'training',
          `Weekly Training: +${req.body.amount}`,
          bankID,
        ],
      ];
    case 'Coaching':
      return [
        'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription, bankID) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.cookies.userid,
          req.body.pid,
          req.body.amount,
          'seasonal coaching',
          `Seasonal Coaching: +${req.body.amount}`,
          bankID,
        ],
      ];
    default:
      assertUnreachable(req.body.type as never);
      return null;
  }
};

const getBankTransactionQuery = (
  req: PlayerEventNextApiRequest,
  cost: number,
) => {
  switch (req.body.type) {
    case 'Activity Check':
    case 'Training Camp':
      return null;
    case 'Training':
      return [
        'INSERT INTO bankTransactions (uid, amount, submitByID, description, status, type) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.cookies.userid,
          -cost,
          req.cookies.userid,
          `Weekly Training: +${req.body.amount}`,
          'completed',
          'training',
        ],
      ];
    case 'Coaching':
      return [
        'INSERT INTO bankTransactions (uid, amount, submitByID, description, status, type) VALUES (?, ?, ?, ?, ?, ?)',
        [
          req.cookies.userid,
          -cost,
          req.cookies.userid,
          `Seasonal Coaching: +${req.body.amount}`,
          'completed',
          'seasonal coaching',
        ],
      ];
    default:
      assertUnreachable(req.body.type as never);
      return null;
  }
};

export default async function handler(
  req: PlayerEventNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    req.body.type !== 'Activity Check' &&
    (!req.body.amount || req.body.amount < 1)
  ) {
    res.status(403).end('Invalid request');
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

  const currentPlayer = await query<
    InternalPlayerInfo & InternalBankBalance & InternalWeeklyCounts
  >(
    SQL`SELECT * FROM playerInfo
        INNER JOIN bankBalance as bank
        ON playerInfo.userID=bank.uid
        INNER JOIN weeklyCounts as counts
        ON playerInfo.playerUpdateID=counts.playerUpdateID
        WHERE playerInfo.userID=${req.cookies.userid}
        AND playerInfo.playerUpdateID=${req.body.pid};`,
  );

  let isRookie = false;
  let isDFA = false;
  let hasDoneActivity = false;

  if (
    'error' in currentSeason ||
    'error' in currentPlayer ||
    !currentPlayer.length ||
    !currentSeason.length ||
    currentPlayer[0].suspended ||
    currentPlayer[0].status !== 'active'
  ) {
    res.status(403).end('Invalid request');
    return;
  } else {
    isRookie =
      currentPlayer[0]?.season === null ||
      currentPlayer[0]?.season > currentSeason[0].season;

    isDFA =
      currentPlayer[0]?.season === null ||
      currentPlayer[0]?.season > currentSeason[0].season + 1;

    hasDoneActivity = checkHasDoneActivity(
      isRookie,
      currentPlayer[0],
      req.body.type,
      req.body.amount,
    );
  }

  const trainingCampTPE = getTrainingCampTPE(
    currentPlayer[0].season ?? 0,
    currentSeason[0].season,
  );

  const activityCost = getActivityCost(
    isRookie,
    req.body.type,
    req.body.amount,
  );

  if (
    isNaN(activityCost) ||
    (req.body.type !== 'Activity Check' &&
      req.body.type !== 'Training Camp' &&
      currentPlayer[0].bankBalance - activityCost < MAXIMUM_BANK_OVERDRAFT) ||
    ((req.body.type === 'Coaching' || req.body.type === 'Training Camp') &&
      isDFA) ||
    activityCost < 0 ||
    hasDoneActivity
  ) {
    res.status(403).end('Invalid request');
    return;
  }

  const results = await transaction()
    .query(() => getBankTransactionQuery(req, activityCost))
    .query((r: { affectedRows: number; insertId: number }) => {
      if (r.affectedRows > 0 && r.insertId) {
        return getTPEEventsQuery({ req, bankID: r.insertId });
      } else if (req.body.type === 'Activity Check') {
        return getTPEEventsQuery({ req });
      } else if (req.body.type === 'Training Camp') {
        return getTPEEventsQuery({ req, trainingCampTPE });
      } else {
        throw new Error('error');
      }
    })
    .query(() => {
      if (req.body.type === 'Coaching') {
        return [
          'UPDATE playerInfo SET coachingPurchased=coachingPurchased+? WHERE playerUpdateID=?;',
          [req.body.amount, req.body.pid],
        ];
      } else if (req.body.type === 'Training Camp') {
        return [
          'UPDATE playerInfo SET teamTrainingCamp=? WHERE playerUpdateID=?;',
          [trainingCampTPE, req.body.pid],
        ];
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
    amount:
      req.body.type === 'Activity Check'
        ? 2
        : req.body.type === 'Training Camp'
        ? trainingCampTPE
        : req.body.amount,
  });
}
