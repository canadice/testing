import { Progress } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { startCase } from 'lodash';
import { useMemo } from 'react';
import { TPEEvent } from 'typings';
import { formatDateTime } from 'utils/formatDateTime';

import { Link } from '../Link';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { TPE_EVENTS_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<TPEEvent>();

export const TPEEventsTable = ({
  data,
  allDetail = false,
  isLoading = false,
}: {
  data: Array<TPEEvent>;
  allDetail?: boolean;
  isLoading?: boolean;
  title?: string;
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('taskGroupID', {
        header: () => <TableHeader title="Group">Group</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('playerName', {
        header: () => (
          <TableHeader title="Player Name">Player Name</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('taskType', {
        header: () => <TableHeader title="Type">Type</TableHeader>,
        cell: (props) => startCase(props.getValue()),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('taskDescription', {
        header: () => (
          <TableHeader title="Description">Description</TableHeader>
        ),
        cell: (props) => (
          <>
            {props.row.original.taskThreadID ? (
              <Link
                className="!hover:no-underline text-blue600"
                href={`https://simulationhockey.com/showthread.php?tid=${props.row.original.taskThreadID}`}
              >
                {props.row.original.taskDescription}
              </Link>
            ) : (
              props.row.original.taskDescription
            )}
          </>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('TPEChange', {
        header: () => <TableHeader title="Amount">Amount</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('submissionDate', {
        header: () => <TableHeader title="Date">Date</TableHeader>,
        enableGlobalFilter: true,
        cell: (props) => formatDateTime(props.getValue()),
      }),
      columnHelper.accessor('submittedBy', {
        header: () => (
          <TableHeader title="Submitted By">Submitted By</TableHeader>
        ),
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
        taskGroupID: allDetail,
        playerName: allDetail,
      },
    },
  });

  return (
    <>
      <Table<TPEEvent> table={table} tableBehavioralFlags={TPE_EVENTS_TABLE} />
      {isLoading && <Progress size="xs" isIndeterminate />}
    </>
  );
};
