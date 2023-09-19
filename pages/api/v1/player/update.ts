import { AttributeFormTypes } from 'components/playerForms/attributeForms/attributeFormFlags';
import { AttributeChange } from 'components/playerForms/editAttributes/EditAttributesForm';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import {
  EXCESSIVE_REGRESSION_THRESHOLD,
  REDISTRIBUTION_COSTS,
  MAX_REDISTRIBUTION_TPE,
  CAN_HANDLE_PLAYER_REGRESSION,
} from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import mysql from 'mysql';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { GoalieAttributes, Player, SkaterAttributes } from 'typings';
import { InternalBankBalance, InternalPlayerInfo } from 'typings/portal-db';
import { assertUnreachable } from 'utils/assertUnreachable';
import { isValidDecrease, isValidIncrease } from 'utils/attributeValidators';
import { getAvailableTPE } from 'utils/getAvailableTPE';
import { getRedistributionTPE } from 'utils/getRedistributionTPE';
import { isValidTPETransaction } from 'utils/isValidTPETransaction';

interface PlayerUpdateNextApiRequest extends NextApiRequest {
  body: {
    type: Exclude<AttributeFormTypes, 'Create'>;
    changes: AttributeChange[];
    info: Player;
    goalie?: GoalieAttributes;
    skater?: SkaterAttributes;
  };
}

export default async function handler(
  req: PlayerUpdateNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      selfOnly: { pid: req.body.info.pid },
      validRoles:
        req.body.type === 'Regression'
          ? CAN_HANDLE_PLAYER_REGRESSION
          : undefined,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const isValidRequest = async () => {
    switch (req.body.type) {
      case 'Update':
        return isValidIncrease(
          req.body.changes,
          req.body.info,
          req.body.goalie,
          req.body.skater,
        );
      case 'Regression':
        const availableTPE = await getAvailableTPE(
          req.body.info,
          req.body.goalie,
          req.body.skater,
        );

        return (
          isValidDecrease(
            req.body.changes,
            req.body.info,
            req.body.goalie,
            req.body.skater,
          ) && availableTPE <= EXCESSIVE_REGRESSION_THRESHOLD
        );
      case 'Redistribute':
        return isValidDecrease(
          req.body.changes,
          req.body.info,
          req.body.goalie,
          req.body.skater,
        );
      default:
        assertUnreachable(req.body.type as never);
        return false;
    }
  };

  const isValid =
    (await isValidRequest()) &&
    (await isValidTPETransaction(
      req.body.info,
      req.body.goalie,
      req.body.skater,
    ));

  if (!isValid) {
    res.status(400).end('Invalid request');
    return;
  }

  const processUpdate = async () => {
    switch (req.body.type) {
      case 'Update':
      case 'Regression':
        return await transaction()
          .query(
            SQL`UPDATE `
              .append(
                req.body.info.position === 'Goalie'
                  ? 'goalieAttributes SET '
                  : 'skaterAttributes SET ',
              )
              .append(
                `${req.body.changes.map(
                  (update) =>
                    `${mysql.escapeId(update.attribute)}=${update.newValue}`,
                )}`,
              )
              .append(SQL` WHERE playerUpdateID=${req.body.info.pid}`),
          )
          .query(() => [
            'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES ?',
            [
              req.body.changes.map((update) => [
                req.body.info.pid,
                update.attribute,
                update.newValue,
                update.oldValue,
                req.cookies.userid,
                'NotRequired',
              ]),
            ],
          ])
          .rollback((_e: any) => {})
          .commit();
      case 'Redistribute':
        let costModifier = Number(REDISTRIBUTION_COSTS.standard);
        const currentSeason = await query<{ season: number }>(
          SQL`SELECT * FROM seasons ORDER BY season DESC LIMIT 1;`,
        );

        const currentPlayer = await query<
          InternalPlayerInfo & InternalBankBalance
        >(
          SQL`SELECT * FROM playerInfo
              INNER JOIN bankBalance as bank
              ON playerInfo.userID=bank.uid
              WHERE playerInfo.userID=${req.body.info.uid}
              AND playerInfo.playerUpdateID=${req.body.info.pid};`,
        );

        const redistributedTPE = await getRedistributionTPE(
          req.body.info,
          req.body.changes,
        );

        if (
          'error' in currentSeason ||
          'error' in currentPlayer ||
          !redistributedTPE
        ) {
          throw new Error('error');
        } else {
          costModifier =
            currentPlayer[0].season === currentSeason[0].season
              ? REDISTRIBUTION_COSTS.sophomore
              : REDISTRIBUTION_COSTS.standard;

          if (
            currentPlayer[0].usedRedistribution + redistributedTPE >
              MAX_REDISTRIBUTION_TPE ||
            currentPlayer[0].bankBalance < redistributedTPE * costModifier
          ) {
            throw new Error('error');
          }
        }

        return await transaction()
          .query(() => [
            'UPDATE playerInfo SET usedRedistribution=? WHERE playerUpdateID=?;',
            [
              currentPlayer[0].usedRedistribution + redistributedTPE,
              req.body.info.pid,
            ],
          ])
          .query(() => {
            if (costModifier !== 0) {
              return [
                'INSERT INTO bankTransactions (uid, amount, submitByID, description, status, type) VALUES (?, ?, ?, ?, ?, ?)',
                [
                  req.body.info.uid,
                  -redistributedTPE * costModifier,
                  req.cookies.userid,
                  req.body.type,
                  'completed',
                  'redistribution',
                ],
              ];
            } else {
              return null;
            }
          })
          .query(
            SQL`UPDATE `
              .append(
                req.body.info.position === 'Goalie'
                  ? 'goalieAttributes SET '
                  : 'skaterAttributes SET ',
              )
              .append(
                `${req.body.changes.map(
                  (update) => `${update.attribute}=${update.newValue}`,
                )}`,
              )
              .append(SQL` WHERE playerUpdateID=${req.body.info.pid}`),
          )
          .query(() => [
            'INSERT INTO updateEvents (playerUpdateID, attributeChanged, newValue, oldValue, performedByID, status) VALUES ?',
            [
              req.body.changes.map((update) => [
                req.body.info.pid,
                update.attribute,
                update.newValue,
                update.oldValue,
                req.cookies.userid,
                'NotRequired',
              ]),
            ],
          ])
          .rollback((_e: any) => {})
          .commit();
      default:
        assertUnreachable(req.body.type as never);
        return { error: 'unreachable' };
    }
  };

  const results = await processUpdate();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
