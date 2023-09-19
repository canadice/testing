import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import {
  BANK_TRANSACTION_TYPES,
  CAN_PROCESS_BANK_TRANSACTIONS,
} from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { BankTransaction } from 'typings';
import { InternalBankBalance } from 'typings/portal-db';

interface BankTransactionNextApiRequest extends NextApiRequest {
  body: {
    transactions: BankTransaction[];
  };
}

const getInsertQuery = (
  transactions: BankTransaction[],
  status: Extract<BankTransaction['status'], 'pending' | 'completed'>,
  userID?: string,
  groupID?: number,
) => {
  if (status === 'pending') {
    return [
      'INSERT INTO bankTransactions (uid, status, type, description, amount, submitByID, groupName, groupID) VALUES ?',
      [
        transactions.map((transaction) => [
          transaction.uid,
          status,
          transaction.type,
          transaction.description,
          transaction.amount,
          userID,
          transaction.groupName,
          groupID,
        ]),
      ],
    ];
  } else {
    return [
      'INSERT INTO bankTransactions (uid, status, type, description, amount, submitByID, groupName, groupID, approvedByID, approvedDate) VALUES ?',
      [
        transactions.map((transaction) => [
          transaction.uid,
          status,
          transaction.type,
          transaction.description,
          transaction.amount,
          userID,
          transaction.groupName,
          groupID,
          userID,
          new Date(),
        ]),
      ],
    ];
  }
};

export default async function handler(
  req: BankTransactionNextApiRequest,
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

  if (
    req.body.transactions.some(
      (transaction) =>
        !BANK_TRANSACTION_TYPES.includes(transaction.type) ||
        (req.body.transactions.length > 1 &&
          req.body.transactions.some((transaction) => !transaction.groupName)),
    )
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  let transactionStatus: Extract<
    BankTransaction['status'],
    'pending' | 'completed'
  > = 'pending';

  if (
    await checkUserAuthorization(req, {
      validRoles: CAN_PROCESS_BANK_TRANSACTIONS,
    })
  ) {
    transactionStatus = 'completed';
  }

  const deductions = req.body.transactions.filter(
    (transactions) => transactions.amount < 0,
  );

  if (deductions.length > 0) {
    const hasDeductionsFromOtherAccounts = deductions.some(
      (deduction) => deduction.uid.toString() !== req.cookies.userid,
    );

    if (hasDeductionsFromOtherAccounts) {
      if (
        !(await checkUserAuthorization(req, {
          validRoles: [
            'BANKER',
            'SHL_COMMISSIONER',
            'SMJHL_COMMISSIONER',
            'SHL_HO',
            'SMJHL_HO',
          ],
        }))
      ) {
        res.status(401).end(`Not authorized`);
        return;
      }
    }

    const deductionsFromOwnAccount = deductions.filter(
      (deduction) => deduction.uid.toString() === req.cookies.userid,
    );

    if (deductionsFromOwnAccount.length > 0) {
      const bankResponse = await query<InternalBankBalance>(
        SQL`SELECT * FROM bankBalance WHERE uid=${req.cookies.userid};`,
      );

      if ('error' in bankResponse) {
        res.status(500).end('Server connection failed');
        return;
      }

      if (!bankResponse.length) {
        res.status(400).end('Invalid request');
        return;
      }

      const [user] = bankResponse;

      const totalDeductionFromOwnAccount = deductionsFromOwnAccount.reduce(
        (a, b) => {
          return a + b.amount;
        },
        0,
      );

      if (-totalDeductionFromOwnAccount > user.bankBalance) {
        res.status(400).end('Invalid request');
        return;
      }
    }
  }

  let groupID: number | undefined = undefined;

  const groupIDResponse = await query<{ nextAvailableGroupID: number }>(
    SQL`SELECT MAX(groupID) + 1 AS nextAvailableGroupID FROM bankTransactions;`,
  );

  if ('error' in groupIDResponse) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!groupIDResponse.length) {
    res.status(400).end('Invalid request');
    return;
  }

  groupID = groupIDResponse[0]?.nextAvailableGroupID ?? 1;

  const results = await transaction()
    .query(() =>
      getInsertQuery(
        req.body.transactions,
        transactionStatus,
        req.cookies.userid,
        groupID,
      ),
    )
    .rollback((_e: any) => {})
    .commit();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!results.length) {
    res.status(400).end('Invalid request');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
