import ReactTableComponent from './ReactableStructure';
import React from 'react';

interface ReactableTableProps {
    columns: any[]; // Replace 'any' with the correct type for your columns
    data: any[]; // Replace 'any' with the correct type for your data
}

const ReactableTable: React.FC<ReactableTableProps> = ({ columns, data }) => {
    // console.log(data);
    if (!data) return <div>Loading</div>; // Or render a placeholder, or loading state

    return (
        <ReactTableComponent columns={columns} data={data} />
    );
};

export default ReactableTable;
