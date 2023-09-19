import { CloseIcon, InfoOutlineIcon } from '@chakra-ui/icons';
import { IconButton, Input, Text, Tooltip } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { TPESubmission } from 'typings';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { TPE_EVENTS_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<TPESubmission>();

export const TPESubmissionTable = ({
  data,
  deleteCallback,
  changeCallback,
}: {
  data: Array<TPESubmission>;
  deleteCallback: (submission: TPESubmission) => void;
  changeCallback: (submission: TPESubmission, newValue: string) => void;
  title?: string;
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('uid', {
        header: () => <TableHeader title="User ID">User ID</TableHeader>,
        cell: (props) => (
          <Text
            className="flex flex-nowrap items-center justify-center whitespace-nowrap"
            color={
              props.row.original.tempID.startsWith('duplicate-')
                ? 'red'
                : 'initial'
            }
          >
            {props.row.original.tempID.startsWith('duplicate-') && (
              <Tooltip label="This is a duplicated record.">
                <InfoOutlineIcon className="mr-2" color="red" />
              </Tooltip>
            )}
            {props.getValue()}
          </Text>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('username', {
        header: () => <TableHeader title="Username">Username</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('playerName', {
        header: () => (
          <TableHeader title="Player Name">Player Name</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('TPEChange', {
        header: () => <TableHeader title="Amount">Amount</TableHeader>,
        cell: (props) => (
          <Input
            type="number"
            defaultValue={props.getValue()}
            onBlur={(e) => changeCallback(props.row.original, e.target.value)}
          />
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.display({
        id: 'actions',
        cell: (props) => (
          <IconButton
            variant="outline"
            colorScheme="red"
            icon={<CloseIcon />}
            aria-label={`Remove Player: ${props.row.original.username}`}
            onClick={(_e) => deleteCallback(props.row.original)}
          />
        ),
      }),
    ],
    [changeCallback, deleteCallback],
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
  });

  return (
    <Table<TPESubmission>
      table={table}
      tableBehavioralFlags={TPE_EVENTS_TABLE}
    />
  );
};
