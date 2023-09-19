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

export const TPESubmissionTableReadOnly = ({
  data,
}: {
  data: Array<TPESubmission>;
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('uid', {
        header: () => <TableHeader title="User ID">User ID</TableHeader>,
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
  });

  return (
    <Table<TPESubmission>
      table={table}
      tableBehavioralFlags={TPE_EVENTS_TABLE}
    />
  );
};
