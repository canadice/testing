import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { STARTING_TPE } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalBankTransactions,
  InternalPlayerInfo,
} from 'typings/portal-db';
import { isValidTPETransaction } from 'utils/isValidTPETransaction';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (!(await checkUserAuthorization(req))) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const activePlayer = await query<InternalPlayerInfo>(
    SQL`SELECT * FROM playerInfo
        WHERE playerInfo.userID=${req.cookies.userid}
        AND playerInfo.status IN ('pending', 'active', 'denied');`,
  );

  if ('error' in activePlayer) {
    res.status(500).end('Server connection failed');
    return;
  }

  const isValid = await isValidTPETransaction(
    req.body.info,
    req.body.goalie,
    req.body.skater,
  );

  if (!isValid || activePlayer.length) {
    res.status(400).end('Invalid request');
    return;
  }

  const attributeQuery = (playerUpdateID: number) => {
    if (req.body.info.position === 'Goalie') {
      return [
        `INSERT INTO goalieAttributes (
            playerUpdateID, 
            blocker, 
            glove, 
            passing, 
            pokeCheck, 
            positioning, 
            rebound, 
            recovery, 
            puckhandling, 
            lowShots, 
            reflexes, 
            skating, 
            mentalToughness, 
            goaltenderStamina
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          playerUpdateID,
          req.body.goalie.blocker,
          req.body.goalie.glove,
          req.body.goalie.passing,
          req.body.goalie.pokeCheck,
          req.body.goalie.positioning,
          req.body.goalie.rebound,
          req.body.goalie.recovery,
          req.body.goalie.puckhandling,
          req.body.goalie.lowShots,
          req.body.goalie.reflexes,
          req.body.goalie.skating,
          req.body.goalie.mentalToughness,
          req.body.goalie.goaltenderStamina,
        ],
      ];
    } else {
      return [
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
          playerUpdateID,
          req.body.skater.screening,
          req.body.skater.gettingOpen,
          req.body.skater.passing,
          req.body.skater.puckhandling,
          req.body.skater.shootingAccuracy,
          req.body.skater.shootingRange,
          req.body.skater.offensiveRead,
          req.body.skater.checking,
          req.body.skater.hitting,
          req.body.skater.positioning,
          req.body.skater.stickchecking,
          req.body.skater.shotBlocking,
          req.body.skater.faceoffs,
          req.body.skater.defensiveRead,
          req.body.skater.acceleration,
          req.body.skater.agility,
          req.body.skater.balance,
          req.body.skater.speed,
          req.body.skater.stamina,
          req.body.skater.strength,
          req.body.skater.fighting,
          req.body.skater.aggression,
          req.body.skater.bravery,
        ],
      ];
    }
  };

  const results = await transaction()
    .query(
      `INSERT INTO playerInfo (
        userID, 
        name, 
        position, 
        handedness, 
        jerseyNumber, 
        height, 
        weight, 
        birthplace, 
        recruiter, 
        render,
        iihfNation
        ) VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.cookies.userid,
        req.body.info.name,
        req.body.info.position,
        req.body.info.handedness,
        req.body.info.jerseyNumber,
        req.body.info.height,
        req.body.info.weight,
        req.body.info.birthplace,
        req.body.info.recruiter,
        req.body.info.render,
        req.body.info.iihfNation,
      ],
    )
    .query(
      `SELECT * FROM playerInfo WHERE userID=${req.cookies.userid} AND status='pending'`,
    )
    .query((r: InternalPlayerInfo[]) => {
      if (r.length > 0) {
        return attributeQuery(r[0].playerUpdateID);
      } else {
        throw new Error('error');
      }
    })
    .query(
      `SELECT * FROM playerInfo WHERE userID=${req.cookies.userid} AND status='pending'`,
    )
    .query((r: InternalPlayerInfo[]) => {
      if (r.length > 0) {
        return [
          'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription) VALUES (?, ?, ?, ?, ?)',
          [
            req.cookies.userid,
            r[0].playerUpdateID,
            STARTING_TPE,
            'Create',
            'Starting TPE',
          ],
        ];
      } else {
        throw new Error('error');
      }
    })
    .query(SQL`SELECT * FROM bankTransactions WHERE uid=${req.cookies.userid};`)
    .query((r: InternalBankTransactions[]) => {
      if (r.length === 0) {
        return [
          'INSERT INTO bankTransactions (uid, amount, submitByID, description, status, type) VALUES (?, ?, ?, ?, ?, ?)',
          [
            req.cookies.userid,
            500000,
            req.cookies.userid,
            'New Account',
            'completed',
            'other',
          ],
        ];
      } else {
        return null;
      }
    })
    .query(
      `SELECT * FROM playerInfo WHERE userID=${req.cookies.userid} AND status='pending'`,
    )
    .query((r: InternalPlayerInfo[]) => {
      if (r.length > 0) {
        return [
          'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
          [
            r[0].playerUpdateID,
            'status',
            'active',
            'pending',
            req.cookies.userid,
            'pending',
          ],
        ];
      } else {
        throw new Error('error');
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
