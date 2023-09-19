import { PLAYER_DEFAULTS, Position } from 'components/playerForms/constants';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_APPROVE_PLAYERS } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalSkaterAttributes,
  InternalUpdateEvents,
} from 'typings/portal-db';
import { getSkaterChangeQuery } from 'utils/getSkaterChangeQuery';

interface ApproveNextApiRequest extends NextApiRequest {
  body: {
    eventID: string;
    season?: number;
  };
}

const getDefaultSkaterInsertQuery = (pid: number) => [
  `INSERT INTO skaterAttributes (
        playerUpdateID, 
        screening, 
        gettingOpen, 
        passing, 
        puckhandling, 
        shootingAccuracy, 
        shootingRange, 
        offensiveRead, 
        checking, 
        hitting, 
        positioning, 
        stickchecking, 
        shotBlocking, 
        faceoffs, 
        defensiveRead, 
        acceleration, 
        agility, 
        balance, 
        speed, 
        stamina, 
        strength, 
        fighting, 
        aggression, 
        bravery
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
  [
    pid,
    PLAYER_DEFAULTS.skater.screening,
    PLAYER_DEFAULTS.skater.gettingOpen,
    PLAYER_DEFAULTS.skater.passing,
    PLAYER_DEFAULTS.skater.puckhandling,
    PLAYER_DEFAULTS.skater.shootingAccuracy,
    PLAYER_DEFAULTS.skater.shootingRange,
    PLAYER_DEFAULTS.skater.offensiveRead,
    PLAYER_DEFAULTS.skater.checking,
    PLAYER_DEFAULTS.skater.hitting,
    PLAYER_DEFAULTS.skater.positioning,
    PLAYER_DEFAULTS.skater.stickchecking,
    PLAYER_DEFAULTS.skater.shotBlocking,
    PLAYER_DEFAULTS.skater.faceoffs,
    PLAYER_DEFAULTS.skater.defensiveRead,
    PLAYER_DEFAULTS.skater.acceleration,
    PLAYER_DEFAULTS.skater.agility,
    PLAYER_DEFAULTS.skater.balance,
    PLAYER_DEFAULTS.skater.speed,
    PLAYER_DEFAULTS.skater.stamina,
    PLAYER_DEFAULTS.skater.strength,
    PLAYER_DEFAULTS.skater.fighting,
    PLAYER_DEFAULTS.skater.aggression,
    PLAYER_DEFAULTS.skater.bravery,
  ],
];

const getChangeQuery = (
  updateEvent: InternalUpdateEvents,
  swapped?: boolean,
) => {
  switch (updateEvent.attributeChanged) {
    case 'Position':
      if (!swapped) {
        return [
          'UPDATE playerInfo SET position=? WHERE playerUpdateID=?',
          [updateEvent.newValue, updateEvent.playerUpdateID],
        ];
      } else {
        return [
          'UPDATE playerInfo SET position=?, positionChanged=? WHERE playerUpdateID=?',
          [updateEvent.newValue, 1, updateEvent.playerUpdateID],
        ];
      }
    case 'Name':
      return [
        'UPDATE playerInfo SET name=? WHERE playerUpdateID=?',
        [updateEvent.newValue, updateEvent.playerUpdateID],
      ];
    case 'Render':
      return [
        'UPDATE playerInfo SET render=? WHERE playerUpdateID=?',
        [updateEvent.newValue, updateEvent.playerUpdateID],
      ];
    default:
      return false;
  }
};

export default async function handler(
  req: ApproveNextApiRequest,
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

  let playerAttributes: InternalSkaterAttributes | undefined = undefined;

  if (
    updateEvents[0].attributeChanged === 'Position' &&
    updateEvents[0].oldValue !== 'Goalie'
  ) {
    const attributes = await query<InternalSkaterAttributes>(
      SQL`SELECT * FROM skaterAttributes WHERE playerUpdateID=${updateEvents[0].playerUpdateID};`,
    );
    if ('error' in attributes || !attributes.length) {
      res.status(500).end('Server connection failed');
      return;
    }
    playerAttributes = attributes[0];
  }

  const processTransaction = async () => {
    switch (updateEvents[0].attributeChanged) {
      case 'Position':
        if (updateEvents[0].oldValue === 'Goalie') {
          return await transaction()
            .query(
              SQL`DELETE FROM goalieAttributes WHERE playerUpdateID=${updateEvents[0].playerUpdateID};`,
            )
            .query(() =>
              getDefaultSkaterInsertQuery(updateEvents[0].playerUpdateID),
            )
            .query(() => getChangeQuery(updateEvents[0]))
            .query(() => [
              'UPDATE updateEvents SET approvedByID=?, approvalDate=?, status=? WHERE eventID=?;',
              [req.cookies.userid, new Date(), 'approved', req.body.eventID],
            ])
            .rollback((_e: any) => {})
            .commit();
        } else {
          return await transaction()
            .query(
              getSkaterChangeQuery(
                updateEvents[0].newValue as Position,
                updateEvents[0].oldValue as Position,
                updateEvents[0].playerUpdateID,
                playerAttributes as InternalSkaterAttributes,
              ),
            )
            .query(() => getChangeQuery(updateEvents[0], true))
            .query(() => [
              'UPDATE updateEvents SET approvedByID=?, approvalDate=?, status=? WHERE eventID=?;',
              [req.cookies.userid, new Date(), 'approved', req.body.eventID],
            ])
            .rollback((_e: any) => {})
            .commit();
        }
      case 'status':
        if (
          (updateEvents[0].oldValue === 'pending' ||
            updateEvents[0].oldValue === 'denied') &&
          updateEvents[0].newValue === 'active' &&
          req.body.season
        ) {
          return await transaction()
            .query(() => [
              'UPDATE playerInfo SET status=?, season=?, currentLeague=? WHERE playerUpdateID=?;',
              [
                'active',
                req.body.season,
                'SMJHL',
                updateEvents[0].playerUpdateID,
              ],
            ])
            .query(() => [
              'UPDATE updateEvents SET approvedByID=?, approvalDate=?, status=? WHERE eventID=?;',
              [req.cookies.userid, new Date(), 'approved', req.body.eventID],
            ])
            .rollback((_e: any) => {})
            .commit();
        } else {
          return Promise.reject({ error: 'Invalid request' });
        }
      default:
        return await transaction()
          .query(() => getChangeQuery(updateEvents[0]))
          .query(() => [
            'UPDATE updateEvents SET approvedByID=?, approvalDate=?, status=? WHERE eventID=?;',
            [req.cookies.userid, new Date(), 'approved', req.body.eventID],
          ])
          .rollback((_e: any) => {})
          .commit();
    }
  };

  const results = processTransaction();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
