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
import { UpdateEvents } from 'typings';
import { formatDateTime } from 'utils/formatDateTime';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { UPDATE_EVENTS_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<UpdateEvents>();

export const UpdateEventsTable = ({
  data,
}: {
  data: Array<UpdateEvents>;
  title?: string;
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor('attributeChanged', {
        header: () => (
          <TableHeader title="Type/Attribute">Type/Attribute</TableHeader>
        ),
        cell: (props) => startCase(props.getValue()),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('oldValue', {
        header: () => (
          <TableHeader title="Previous Value">Previous Value</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('newValue', {
        header: () => <TableHeader title="New Value">New Value</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('eventDate', {
        header: () => <TableHeader title="Changed On">Changed On</TableHeader>,
        enableGlobalFilter: true,
        cell: (props) => formatDateTime(props.getValue()),
      }),
      columnHelper.accessor('status', {
        header: () => <TableHeader title="Status">Status</TableHeader>,
        enableGlobalFilter: true,
        cell: (props) => startCase(props.getValue()),
      }),
      columnHelper.accessor('performedBy', {
        header: () => (
          <TableHeader title="Performed By">Performed By</TableHeader>
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
  });

  return (
    <Table<UpdateEvents>
      table={table}
      tableBehavioralFlags={UPDATE_EVENTS_TABLE}
    />
  );
};
