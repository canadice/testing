import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import _ from 'lodash';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { BankTransactionSummary, BankTransactionTypes } from 'typings';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

const incrementDate = (date?: string): string => {
  const parsedDate = new Date(date ?? '');
  if (_.isDate(parsedDate)) {
    parsedDate.setDate(parsedDate.getDate() + 1);
    return parsedDate.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<BankTransactionSummary[]>,
): Promise<void> => {
  await use(req, res, cors);

  const {
    user,
    type,
    status,
    requester,
    reviewer,
    payee,
    date,
    submitDate,
    approvedDate,
    teamID,
    league,
    groupID,
    showCards,
    showActivities,
  } = req.query;

  const response = await query<BankTransactionSummary>(
    SQL`SELECT 
          CASE
              WHEN groupID IS NULL THEN id
              ELSE groupID
          END AS id,
          CASE
              WHEN groupID IS NULL THEN 'INDIVIDUAL'
              ELSE 'GROUP'
          END AS recipient,
          CASE
              WHEN groupID IS NULL THEN amount
              ELSE SUM(amount)
          END AS amount,
          CASE
              WHEN groupID IS NULL THEN description
              ELSE groupName
          END AS name,
          type,
          CASE
              WHEN COUNT(DISTINCT bt.status) = 1 THEN MAX(bt.status)
              ELSE 'mixed'
          END AS status,
          submitDate,
          approvedDate,
          reversedDate,
          submitUser.username AS submitBy,
          approvedUser.username AS approvedBy,
          reversedUser.username AS reversedBy
      FROM bankTransactions bt
      LEFT JOIN userInfo AS submitUser ON bt.submitByID = submitUser.userID
      LEFT JOIN userInfo AS approvedUser ON bt.approvedByID = approvedUser.userID
      LEFT JOIN userInfo AS reversedUser ON bt.reversedByID = reversedUser.userID
      LEFT JOIN (
        SELECT
            userID,
            currentLeague,
            currentTeamID
        FROM playerInfo 
        ORDER BY playerUpdateID DESC 
        LIMIT 1
        ) AS pi ON bt.uid = pi.userID
      WHERE 1 `
      .append(showCards === undefined ? SQL`AND bt.type!='cards' ` : '')
      .append(
        showActivities === undefined
          ? SQL`AND bt.type not in ('training', 'seasonal coaching', 'redistribution') `
          : '',
      )
      .append(
        user !== undefined
          ? SQL`AND bt.submitByID=${user} `
              .append(`OR bt.approvedByID=${user} `)
              .append(`OR bt.uid=${user} `)
          : '',
      )
      .append(
        requester !== undefined ? SQL`AND bt.submitByID=${requester} ` : '',
      )
      .append(
        reviewer !== undefined ? SQL`AND bt.approvedByID=${reviewer} ` : '',
      )
      .append(payee !== undefined ? SQL`AND bt.uid=${payee} ` : '')
      .append(groupID !== undefined ? SQL`AND bt.groupID=${groupID} ` : '')
      .append(type !== undefined ? SQL`AND bt.type IN (${type}) ` : '')
      .append(status !== undefined ? SQL`AND bt.status IN (${status}) ` : '')
      .append(league !== undefined ? SQL`AND pi.currentLeague=${league} ` : '')
      .append(teamID !== undefined ? SQL`AND pi.currentTeamID=${teamID} ` : '')
      .append(
        date !== undefined && typeof date === 'string'
          ? SQL`AND bt.submitDate >='`
              .append(`${date}`)
              .append(` 00:00:00' `)
              .append(`AND bt.submitDate <'`)
              .append(`${incrementDate(date)}`)
              .append(` 00:00:00' `)
              .append(`OR bt.approvedDate >='`)
              .append(`${date}`)
              .append(` 00:00:00' `)
              .append(`OR bt.approvedDate <'`)
              .append(`${incrementDate(date)}`)
              .append(` 00:00:00' `)
          : '',
      )
      .append(
        submitDate !== undefined && typeof submitDate === 'string'
          ? SQL`AND bt.submitDate >='`
              .append(`${submitDate}`)
              .append(` 00:00:00' `)
              .append(`AND bt.submitDate <'`)
              .append(`${incrementDate(submitDate)}`)
              .append(` 00:00:00' `)
          : '',
      )
      .append(
        approvedDate !== undefined && typeof approvedDate === 'string'
          ? SQL`AND bt.approvedDate >='`
              .append(`${approvedDate}`)
              .append(` 00:00:00' `)
              .append(`AND bt.approvedDate <'`)
              .append(`${incrementDate(approvedDate)}`)
              .append(` 00:00:00' `)
          : '',
      )
      .append(
        SQL`
          GROUP BY 
          CASE
              WHEN groupID IS NULL THEN id
              ELSE groupID
          END,
          CASE
              WHEN groupID IS NULL THEN amount
              ELSE groupName
          END,
          type,
          submitDate,
          approvedDate,
          reversedDate
      `,
      )
      .append(`ORDER BY bt.id DESC`),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed: BankTransactionSummary[] = response.map((trans) => ({
    id: trans.id,
    recipient: trans.recipient,
    amount: trans.amount,
    name: trans.name,
    type: trans.type as BankTransactionTypes,
    submitBy: trans.submitBy,
    submitDate: trans.submitDate,
    status: trans.status,
    approvedBy: trans.approvedBy,
    approvedDate: trans.approvedDate,
    reversedBy: trans.reversedBy,
    reversedDate: trans.reversedDate,
  }));

  res.status(200).json(parsed);
};
