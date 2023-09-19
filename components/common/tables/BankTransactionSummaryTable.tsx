import { Link, Progress, Text } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { StatusBadge } from 'components/bank/StatusBadge';
import { startCase } from 'lodash';
import { useMemo } from 'react';
import { BankTransactionSummary } from 'typings';
import { formatCurrency } from 'utils/formatCurrency';
import { formatDateTime } from 'utils/formatDateTime';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { BANK_TRANSACTION_SUMMARY_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<BankTransactionSummary>();

export const BankTransactionSummaryTable = ({
  data,
  isLoading,
}: {
  data: Array<BankTransactionSummary>;
  isLoading: boolean;
  title?: string;
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor(
        ({ name, id, recipient }) => [name, id, recipient],
        {
          header: 'Transaction',
          cell: (props) => {
            const cellValue = props.getValue();
            return (
              <Link
                className="!hover:no-underline ml-2 block max-w-[150px] text-left text-blue600 lg:max-w-[300px]"
                href={`${
                  cellValue[2] === 'GROUP'
                    ? '/bank/transactions/groups'
                    : '/bank/transactions'
                }/${cellValue[1].toString()}`}
              >
                <p className="truncate">{cellValue[0]}</p>
              </Link>
            );
          },
          enableSorting: false,
        },
      ),
      columnHelper.accessor('name', {
        header: () => (
          <TableHeader title="Transaction">Transaction</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('amount', {
        header: () => <TableHeader title="Amount">Amount</TableHeader>,
        cell: (props) => (
          <Text
            className="text-right font-mont"
            color={props.getValue() < 0 ? 'red' : 'green'}
          >
            {formatCurrency(props.getValue())}
          </Text>
        ),
        enableGlobalFilter: false,
      }),
      columnHelper.accessor('type', {
        header: () => <TableHeader title="type">Type</TableHeader>,
        cell: (props) => startCase(props.getValue()),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('submitBy', {
        header: () => <TableHeader title="Requester">Requester</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('submitDate', {
        header: () => <TableHeader title="Requested">Requested</TableHeader>,
        cell: (props) => formatDateTime(props.getValue()),
        enableGlobalFilter: false,
      }),
      columnHelper.accessor('status', {
        header: () => <TableHeader title="Status">Status</TableHeader>,
        cell: (props) => <StatusBadge status={props.getValue()} />,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('approvedDate', {
        header: () => <TableHeader title="Reviewed">Reviewed</TableHeader>,
        cell: (props) =>
          Boolean(props.getValue())
            ? formatDateTime(props.getValue())
            : props.row.original.status === 'pending'
            ? 'Pending'
            : '',
        enableGlobalFilter: false,
      }),
      columnHelper.accessor('approvedBy', {
        header: () => <TableHeader title="Banker">Banker</TableHeader>,
        cell: (props) =>
          Boolean(props.getValue())
            ? props.getValue()
            : props.row.original.status === 'pending'
            ? 'Pending'
            : '',
        enableGlobalFilter: true,
      }),
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableGlobalFilter: true,
    globalFilterFn: simpleGlobalFilterFn,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      columnVisibility: {
        name: false,
      },
    },
  });

  return (
    <>
      <Table<BankTransactionSummary>
        table={table}
        tableBehavioralFlags={BANK_TRANSACTION_SUMMARY_TABLE}
      />
      {isLoading && <Progress size="xs" isIndeterminate />}
    </>
  );
};
