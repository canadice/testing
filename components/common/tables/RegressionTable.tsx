import { Progress } from '@chakra-ui/react';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import { Regression } from 'typings';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { REGRESSION_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<Regression>();

export const RegressionTable = ({
  data,
  isLoading,
}: {
  data: Array<Regression>;
  isLoading: boolean;
  title?: string;
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
      columnHelper.accessor('pid', {
        header: () => <TableHeader title="Player ID">Player ID</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('name', {
        header: () => (
          <TableHeader title="Player Name">Player Name</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('draftSeason', {
        header: () => (
          <TableHeader title="Draft Season">Draft Season</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('oldTPE', {
        header: () => <TableHeader title="Old TPE">Old TPE</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('regressionPct', {
        header: () => (
          <TableHeader title="Regression %">Regression %</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('regressionTPE', {
        header: () => (
          <TableHeader title="Regression TPE">Regression TPE</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('newTPE', {
        header: () => <TableHeader title="New TPE">New TPE</TableHeader>,
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
    <>
      <Table<Regression>
        table={table}
        tableBehavioralFlags={REGRESSION_TABLE}
      />
      {isLoading && <Progress size="xs" isIndeterminate />}
    </>
  );
};
