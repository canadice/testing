import { Button, Link, Text } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { StatusBadge } from 'components/bank/StatusBadge';
import { useCookie } from 'hooks/useCookie';
import { usePermissions } from 'hooks/usePermissions';
import { useMemo } from 'react';
import { BankTransaction, BankTransactionRecipientTypes } from 'typings';
import { formatCurrency } from 'utils/formatCurrency';

import { Table } from './Table';
import { BANK_TRANSACTION_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<BankTransaction>();

export const BankTransactionTable = ({
  data,
  recipient,
  transactionStatus,
  isProcessing,
  handleRevert,
  processingId,
}: {
  data: Array<BankTransaction>;
  recipient: BankTransactionRecipientTypes;
  transactionStatus: string;
  isProcessing: boolean;
  handleRevert: (transactionID: number) => void;
  title?: string;
  processingId?: number;
}) => {
  const { permissions, groups } = usePermissions();
  const [sudo] = useCookie<'true' | 'false'>('sudo', 'false');

  const hasActionButton = useMemo(
    () =>
      (sudo === 'true' && groups?.includes('PORTAL_MANAGEMENT')) ||
      permissions.canProcessBankTransactions,
    [groups, permissions.canProcessBankTransactions, sudo],
  );

  const columns = useMemo(() => {
    const currentColumns = [
      columnHelper.accessor('username', {
        header: () => <TableHeader title="Username">Username</TableHeader>,
        cell: (props) => {
          const transaction = props.row.original;
          return (
            <Link
              className="!hover:no-underline font-mont hover:text-blue600"
              aria-label={
                recipient === 'GROUP' ? 'View Transaction' : 'View Bank'
              }
              href={`${
                recipient === 'GROUP' ? '/bank/transactions' : '/bank/account'
              }/${recipient === 'GROUP' ? transaction.id : transaction.uid}`}
            >
              {transaction.username}
            </Link>
          );
        },
        enableGlobalFilter: false,
      }),
      columnHelper.accessor('amount', {
        header: () => <TableHeader title="Amount">Amount</TableHeader>,
        cell: (props) => (
          <Text
            color={props.row.original.amount > 0 ? 'green' : 'red'}
            className="font-mont"
          >
            {props.row.original.amount > 0 && '+'}
            {formatCurrency(props.row.original.amount)}
          </Text>
        ),
        enableGlobalFilter: false,
      }),
      columnHelper.accessor('description', {
        header: () => (
          <TableHeader title="Description">Description</TableHeader>
        ),
        cell: (props) => (
          <>
            {props.row.original.description?.startsWith('https://') ? (
              <Link href={props.row.original.description}>
                {props.row.original.description}
              </Link>
            ) : (
              props.row.original.description
            )}
          </>
        ),
        enableGlobalFilter: false,
      }),
    ];

    if (transactionStatus === 'mixed') {
      currentColumns.push(
        columnHelper.display({
          id: 'status',
          header: 'Status',
          cell: (props) => <StatusBadge status={props.row.original.status} />,
        }),
      );
    }

    if (hasActionButton) {
      currentColumns.push(
        columnHelper.display({
          id: 'action',
          cell: (props) => (
            <>
              {props.row.original.type !== 'training' &&
                props.row.original.type !== 'seasonal coaching' &&
                props.row.original.type !== 'change' &&
                props.row.original.status === 'completed' && (
                  <Button
                    variant="outline"
                    colorScheme="facebook"
                    isDisabled={isProcessing}
                    onClick={() => handleRevert(props.row.original.id)}
                    isLoading={
                      processingId === props.row.original.id && isProcessing
                    }
                  >
                    Undo
                  </Button>
                )}
            </>
          ),
        }),
      );
    }

    return currentColumns;
  }, [
    handleRevert,
    hasActionButton,
    isProcessing,
    processingId,
    recipient,
    transactionStatus,
  ]);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table<BankTransaction>
      table={table}
      tableBehavioralFlags={BANK_TRANSACTION_TABLE}
      label="Payment Details"
    />
  );
};
