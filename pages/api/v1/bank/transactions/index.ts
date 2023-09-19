import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { BankTransaction, BankTransactionTypes } from 'typings';
import { InternalBankTransactions, InternalUserInfo } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<BankTransaction[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { id, groupID } = req.query;

  if (id === undefined && groupID === undefined) {
    res.status(400).end('Invalid request');
    return;
  }

  const results = await query<
    InternalBankTransactions &
      InternalUserInfo & {
        submitBy: string;
        approvedBy: string | undefined;
      }
  >(
    SQL`SELECT bankTransactions.*, user.username as username, submitter.username as submitBy, approver.username as approvedBy FROM bankTransactions
        LEFT JOIN userInfo as user 
        ON bankTransactions.uid = user.userID
        LEFT JOIN userInfo as submitter
        ON bankTransactions.submitByID = submitter.userID
        LEFT JOIN userInfo as approver
        ON bankTransactions.approvedByID = approver.userID WHERE 1 `
      .append(id !== undefined ? SQL`AND bankTransactions.id=${id} ` : '')
      .append(
        groupID !== undefined
          ? SQL`AND bankTransactions.groupID=${groupID} `
          : '',
      )
      .append(`ORDER BY id DESC`),
  );

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!results.length) {
    res.status(400).end('Invalid request');
    return;
  }

  const parsed: BankTransaction[] = results.map((data) => ({
    id: data.id,
    uid: data.uid,
    username: data.username,
    status: data.status,
    type: data.type as BankTransactionTypes,
    description: data.description,
    amount: data.amount,
    submitByID: data.submitByID,
    submitBy: data.submitBy,
    submitDate: data.submitDate,
    approvedByID: data.approvedByID,
    approvedBy: data.approvedBy,
    approvedDate: data.approvedDate,
    groupName: data.groupName,
    groupID: data.groupID,
  }));

  res.status(200).json(parsed);
};
