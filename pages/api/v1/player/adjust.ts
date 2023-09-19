import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalPlayerInfo } from 'typings/portal-db';
import { isValidTPETransaction } from 'utils/isValidTPETransaction';

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
      selfOnly: { pid: req.body.pid },
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const isValid = await isValidTPETransaction(
    req.body.info,
    req.body.goalie,
    req.body.skater,
  );

  if (!isValid) {
    res.status(400).end('Not enough available TPE');
    return;
  }

  const player = await query<InternalPlayerInfo>(
    SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${req.body.pid} AND status='denied';`,
  );

  if ('error' in player) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!player.length) {
    res.status(400).end('Invalid request');
    return;
  }

  const attributeQuery = () => {
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
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) 
            ON DUPLICATE KEY UPDATE
                blocker=?, 
                glove=?,
                passing=?,
                pokeCheck=?,
                positioning=?,
                rebound=?,
                recovery=?,
                puckhandling=?,
                lowShots=?,
                reflexes=?,
                skating=?,
                mentalToughness=?,
                goaltenderStamina=?`,
        [
          player[0].playerUpdateID,
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
            ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) 
            ON DUPLICATE KEY UPDATE 
                screening=?, 
                gettingOpen=?,
                passing=?, 
                puckhandling=?,
                shootingAccuracy=?,
                shootingRange=?,
                offensiveRead=?,
                checking=?,
                hitting=?,
                positioning=?,
                stickchecking=?,
                shotBlocking=?,
                faceoffs=?,
                defensiveRead=?,
                acceleration=?,
                agility=?,
                balance=?,
                speed=?,
                stamina=?,
                strength=?,
                fighting=?,
                aggression=?,
                bravery=?`,
        [
          player[0].playerUpdateID,
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

  const attributeDeleteQuery = () => {
    if (
      req.body.info.position === 'Goalie' &&
      player[0].position !== 'Goalie'
    ) {
      return SQL`DELETE FROM skaterAttributes WHERE playerUpdateID=${player[0].playerUpdateID};`;
    } else if (
      player[0].position === 'Goalie' &&
      req.body.info.position !== 'Goalie'
    ) {
      return SQL`DELETE FROM goalieAttributes WHERE playerUpdateID=${player[0].playerUpdateID};`;
    }
    return SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${req.body.pid} AND status='denied';`;
  };

  const results = await transaction()
    .query(
      `INSERT INTO playerInfo (
        playerUpdateID
        ) VALUES(?) 
        ON DUPLICATE KEY UPDATE 
            userID=?,
            name=?,
            position=?,
            handedness=?,
            jerseyNumber=?,
            height=?,
            weight=?,
            birthplace=?,
            recruiter=?,
            render=?,
            iihfNation=?,
            status=?`,
      [
        player[0].playerUpdateID,
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
        'pending',
      ],
    )
    .query(attributeDeleteQuery())
    .query(() => attributeQuery())
    .query(() => [
      'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES (?, ?, ?, ?, ?, ?)',
      [
        player[0].playerUpdateID,
        'status',
        'active',
        'denied',
        req.cookies.userid,
        'pending',
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
