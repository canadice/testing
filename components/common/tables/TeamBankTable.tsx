import { Progress, Text } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { Player } from 'typings';
import { formatCurrency } from 'utils/formatCurrency';

import { Link } from '../Link';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { TEAM_BANK_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<Player>();

export const TeamBankTable = ({
  data,
  isLoading,
}: {
  data: Array<Player>;
  isLoading?: boolean;
}) => {
  const columns = useMemo(() => {
    const currentColumns = [
      columnHelper.accessor(({ name, uid }) => [name, uid], {
        header: 'Name',
        cell: (props) => {
          const cellValue = props.getValue();
          return (
            <Link
              className="!hover:no-underline text-blue600"
              href={`/bank/account/${cellValue[1].toString()}`}
            >
              {cellValue[0]}
            </Link>
          );
        },
        enableSorting: false,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <TableHeader title="Player Name">Player Name</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('username', {
        header: () => <TableHeader title="Username">Username</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('bankBalance', {
        header: () => (
          <TableHeader title="Bank Balance">Bank Balance</TableHeader>
        ),
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
    ];
    return currentColumns;
  }, []);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableGlobalFilter: true,
    globalFilterFn: simpleGlobalFilterFn,
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      sorting: [{ id: 'bankBalance', desc: true }],
    },
    state: {
      columnVisibility: {
        name: false,
      },
    },
  });

  return (
    <>
      <Table<Player> table={table} tableBehavioralFlags={TEAM_BANK_TABLE} />
      {isLoading && <Progress size="xs" isIndeterminate />}
    </>
  );
};
