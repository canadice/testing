import { Position } from 'components/playerForms/constants';
import { defaultPlayer } from 'components/playerForms/shared';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_APPROVE_PLAYERS } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  InternalPlayerInfo,
  InternalSkaterAttributes,
} from 'typings/portal-db';
import { getSkaterChangeQuery } from 'utils/getSkaterChangeQuery';

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
      validRoles: CAN_APPROVE_PLAYERS,
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

  if (!player.length) {
    res.status(400).end('Invalid request');
    return;
  }

  let playerAttributes: InternalSkaterAttributes | undefined = undefined;

  if (
    req.body.info.position !== player[0].position &&
    req.body.info.position !== 'Goalie' &&
    player[0].position !== 'Goalie'
  ) {
    const attributes = await query<InternalSkaterAttributes>(
      SQL`SELECT * FROM skaterAttributes WHERE playerUpdateID=${player[0].playerUpdateID};`,
    );
    if ('error' in attributes || !attributes.length) {
      res.status(500).end('Server connection failed');
      return;
    }
    playerAttributes = attributes[0];
  }

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
    return SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${req.body.pid};`;
  };

  const attributeInsertQuery = () => {
    if (
      req.body.info.position === 'Goalie' &&
      player[0].position !== 'Goalie'
    ) {
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
          player[0].playerUpdateID,
          defaultPlayer.goalie.blocker,
          defaultPlayer.goalie.glove,
          defaultPlayer.goalie.passing,
          defaultPlayer.goalie.pokeCheck,
          defaultPlayer.goalie.positioning,
          defaultPlayer.goalie.rebound,
          defaultPlayer.goalie.recovery,
          defaultPlayer.goalie.puckhandling,
          defaultPlayer.goalie.lowShots,
          defaultPlayer.goalie.reflexes,
          defaultPlayer.goalie.skating,
          defaultPlayer.goalie.mentalToughness,
          defaultPlayer.goalie.goaltenderStamina,
        ],
      ];
    } else if (
      player[0].position === 'Goalie' &&
      req.body.info.position !== 'Goalie'
    ) {
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
          player[0].playerUpdateID,
          defaultPlayer.skater.screening,
          defaultPlayer.skater.gettingOpen,
          defaultPlayer.skater.passing,
          defaultPlayer.skater.puckhandling,
          defaultPlayer.skater.shootingAccuracy,
          defaultPlayer.skater.shootingRange,
          defaultPlayer.skater.offensiveRead,
          defaultPlayer.skater.checking,
          defaultPlayer.skater.hitting,
          defaultPlayer.skater.positioning,
          defaultPlayer.skater.stickchecking,
          defaultPlayer.skater.shotBlocking,
          defaultPlayer.skater.faceoffs,
          defaultPlayer.skater.defensiveRead,
          defaultPlayer.skater.acceleration,
          defaultPlayer.skater.agility,
          defaultPlayer.skater.balance,
          defaultPlayer.skater.speed,
          defaultPlayer.skater.stamina,
          defaultPlayer.skater.strength,
          defaultPlayer.skater.fighting,
          defaultPlayer.skater.aggression,
          defaultPlayer.skater.bravery,
        ],
      ];
    }
    return SQL`SELECT * FROM playerInfo WHERE playerUpdateID=${req.body.pid};`;
  };

  const validColumns = [
    'name',
    'position',
    'handedness',
    'jerseyNumber',
    'height',
    'weight',
    'birthplace',
    'recruiter',
    'render',
  ];

  const results = await transaction()
    .query(
      `INSERT INTO playerInfo (
        playerUpdateID
        ) VALUES(?) 
        ON DUPLICATE KEY UPDATE 
            name=?,
            position=?,
            handedness=?,
            jerseyNumber=?,
            height=?,
            weight=?,
            birthplace=?,
            recruiter=?,
            render=?`,
      [
        player[0].playerUpdateID,
        req.body.info.name,
        req.body.info.position,
        req.body.info.handedness,
        req.body.info.jerseyNumber,
        req.body.info.height,
        req.body.info.weight,
        req.body.info.birthplace,
        req.body.info.recruiter,
        req.body.info.render,
      ],
    )
    .query(attributeDeleteQuery())
    .query(
      getSkaterChangeQuery(
        req.body.info.position as Position,
        player[0].position as Position,
        player[0].playerUpdateID,
        playerAttributes as InternalSkaterAttributes,
      ),
    )
    .query(() => attributeInsertQuery())
    .query(() => [
      'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES ?',
      [
        Object.entries(req.body.info)
          .map(([key, value]) => {
            if (value !== player[0][key as keyof InternalPlayerInfo]) {
              return [
                player[0].playerUpdateID,
                key,
                value,
                player[0][key as keyof InternalPlayerInfo],
                req.cookies.userid,
                'NotRequired',
              ];
            }
          })
          .filter(
            (update) =>
              update !== undefined &&
              update !== null &&
              update.length &&
              validColumns.includes(String(update[1])),
          ),
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
