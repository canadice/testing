import { AddIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Button, IconButton, Progress } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { IndexPlayerID, Player } from 'typings';

import { Link } from '../Link';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { INDEX_PLAYER_ID_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<Player>();

const generatedIndexRecordButtons = (
  player: Player,
  leagueID: 0 | 1 | 2 | 3,
  callback: (
    action: 'DELETE' | 'UPDATE' | 'CREATE' | undefined,
    player: Player,
    record?: IndexPlayerID,
  ) => void,
) => {
  if (!player.indexRecords) return null;
  const indexRecords = player.indexRecords.filter(
    (record) => record.leagueID === leagueID,
  );
  return (
    <div className="space-x-2">
      {indexRecords.map((record, index) => (
        <Button
          onClick={() => callback(undefined, player, record)}
          key={`record-${record.indexID}-${record.leagueID}`}
          variant="solid"
          colorScheme={
            player.status === 'active' && index === indexRecords.length - 1
              ? 'green'
              : 'gray'
          }
        >
          <span className="px-2 sm:px-8">
            {`${record.startSeason}${
              index !== indexRecords.length - 1 &&
              record.startSeason !== indexRecords[index + 1].startSeason - 1
                ? ` - ${indexRecords[index + 1].startSeason - 1}`
                : ''
            }`}
          </span>
        </Button>
      ))}
    </div>
  );
};

export const IndexPlayerIDTable = ({
  data,
  callback,
  isLoading,
}: {
  data: Array<Player>;
  callback: (
    action: 'DELETE' | 'UPDATE' | 'CREATE' | undefined,
    player: Player,
    record?: IndexPlayerID,
  ) => void;
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
        enableSorting: true,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <TableHeader title="Player Name">Player Name</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.display({
        id: 'shl',
        header: () => <TableHeader title="SHL">SHL</TableHeader>,
        cell: (props) =>
          generatedIndexRecordButtons(props.row.original, 0, callback),
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'smjhl',
        header: () => <TableHeader title="SMJHL">SMJHL</TableHeader>,
        cell: (props) =>
          generatedIndexRecordButtons(props.row.original, 1, callback),
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'iihf',
        header: () => <TableHeader title="IIHF">IIHF</TableHeader>,
        cell: (props) =>
          generatedIndexRecordButtons(props.row.original, 2, callback),
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'wjc',
        header: () => <TableHeader title="WJC">WJC</TableHeader>,
        cell: (props) =>
          generatedIndexRecordButtons(props.row.original, 3, callback),
        enableSorting: false,
      }),
      columnHelper.display({
        id: 'add',
        cell: (props) => (
          <IconButton
            aria-label="Add Index Record"
            icon={<AddIcon />}
            colorScheme="blue"
            variant="ghost"
            onClick={() => callback('CREATE', props.row.original)}
          />
        ),
        enableSorting: false,
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
        tableBehavioralFlags={INDEX_PLAYER_ID_TABLE}
      />
      {isLoading && <Progress size="xs" isIndeterminate />}
    </>
  );
};
