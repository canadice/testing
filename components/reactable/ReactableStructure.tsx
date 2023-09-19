import React from 'react';
import { useTable } from 'react-table';

interface TableProps {
    columns: any[];
    data: any[];
}

const ReactTableComponent: React.FC<TableProps> = ({ columns, data }) => {
    // Create a table instance
    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({
        columns,
        data,
    });

    // Creates the data component of the react-table
    const DataComponent = () => {
        return (
            <div className="table-container">
                <table {...getTableProps()} className="reactable" style={{ borderCollapse: 'collapse' }}>
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()} className="reactable-header">
                                {headerGroup.headers.map((column, columnIndex) => (
                                    <th
                                        key={columnIndex}
                                        {...column.getHeaderProps()}
                                        className="reactable-header"
                                        style={{
                                            // Add custom styles to freeze the first column (change the index accordingly)
                                            position: columnIndex === 0 ? 'sticky' : 'static',
                                            left: columnIndex === 0 ? 0 : 'auto',
                                            zIndex: columnIndex === 0 ? 1 : 'auto',
                                            padding: '8px',
                                            borderBottom: '1px solid #ccc',
                                            cursor: 'pointer'
                                            // Add any other custom styles for the header cell
                                        }}
                                    >
                                        {column.render('Header')}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()} className="reactable-row" style={{ borderBottom: '1px solid #ccc' }}>
                                    {row.cells.map((cell) => {
                                        return (
                                            <td
                                                {...cell.getCellProps()}
                                                className="reactable-cell"
                                                style={{
                                                    padding: '8px',
                                                    borderBottom: '1px solid #ccc',
                                                    ...cell.column.style,
                                                }}
                                                title={cell.value} // Show the full content on hover
                                            >
                                                {cell.render('Cell')}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <DataComponent />
    )

};

export default ReactTableComponent;
