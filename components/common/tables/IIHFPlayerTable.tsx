import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, Progress } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { Player } from 'typings';

import { Link } from '../Link';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { getPlayerTableBehavioralFlags } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<Player>();

export const IIHFPlayerTable = ({
  data,
  callback,
  isLoading,
}: {
  data: Array<Player>;
  callback: (player: Player) => void;
  isLoading?: boolean;
}) => {
  const columns = useMemo(() => {
    const currentColumns = [
      columnHelper.accessor(({ name, pid }) => [name, pid], {
        header: 'Name',
        cell: (props) => {
          const cellValue = props.getValue();
          return (
            <Link
              className="!hover:no-underline ml-2 block max-w-[150px] text-blue600 lg:max-w-[300px]"
              href={{
                pathname: '/player/[id]',
                query: {
                  id: cellValue[1].toString(),
                },
              }}
              target={'_blank'}
            >
              <p className="truncate">
                <ExternalLinkIcon className="mr-2" />
                {cellValue[0]}
              </p>
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
      columnHelper.accessor('iihfNation', {
        header: () => (
          <TableHeader title="IIHF Nation">IIHF Nation</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.display({
        id: 'actions',
        cell: (props) => (
          <Button
            variant="outline"
            colorScheme="blue"
            onClick={() => callback(props.row.original)}
          >
            Change Federation
          </Button>
        ),
      }),
    ];
    return currentColumns;
  }, [callback]);

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
      <Table<Player>
        table={table}
        tableBehavioralFlags={getPlayerTableBehavioralFlags(true)}
      />
      {isLoading && <Progress size="xs" isIndeterminate />}
    </>
  );
};
