import React, { useMemo } from 'react';
import { useTable, usePagination, useSortBy, useGlobalFilter, Column } from 'react-table';

interface DataReactableProps {
    data: any[]; // Replace 'any' with the correct type for your data
    namedColumns: Column[]; // Replace 'Column' with the correct type for your columns
    initialState: any; // Replace 'any' with the correct type for your initialState
}

const ReactableSettings = ({ data, namedColumns, initialState }: DataReactableProps) => {
    // Specific settings for certain columns
    const specificColumns = React.useMemo(
        () => namedColumns,
        [namedColumns]
    );

    // Dynamically generate columns based on data keys and filter out duplicates and specific columns
    const dynamicColumns = useMemo(() => {
        if (!data || data.length === 0) return [];

        const excludedColumns = ['Name', 'Nationality', 'Position', 'Apps'];

        const dynamicKeys = Object.keys(data[0]).filter(
            (key) =>
                !specificColumns.some((col) => col.accessor === key) &&
                !excludedColumns.includes(key)
        );

        return dynamicKeys.map((key) => ({ Header: key, accessor: key }));
    }, [data, specificColumns]);

    // Combine dynamic and specific columns into a single memo
    const columns = useMemo(() => {
        const accColumnIndex = dynamicColumns.findIndex((col) => col.accessor === 'Acc');
        const visibleColumns = accColumnIndex >= 0 ? dynamicColumns.slice(0, accColumnIndex) : dynamicColumns;
        return [...specificColumns, ...visibleColumns];
    }, [specificColumns, dynamicColumns]);

    // Create a table instance with sorting and global filter functionality
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canNextPage,
        canPreviousPage,
        state: { pageIndex, pageSize },
        gotoPage,
        setGlobalFilter,
        state,
    } = useTable(
        { columns, data, initialState: initialState }, // Set the initial page index and page size
        useGlobalFilter,
        useSortBy,
        usePagination // Add the usePagination hook
    );

    return {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        prepareRow,
        page,
        canNextPage,
        canPreviousPage,
        pageIndex,
        pageSize,
        gotoPage,
        setGlobalFilter,
        state,
    };
};

export default ReactableSettings;
