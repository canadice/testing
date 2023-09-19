import React, { useState, useEffect } from 'react';
import SeasonCell from '../reactable/cellstyles/SeasonCell';
import ClubCell from '../reactable/cellstyles/ClubCell';
import ReactableTable from '../reactable/ReactableTable';

interface ReactTableProps {
    player: string;
}

const GameReactable: React.FC<ReactTableProps> = ({ player }) => {
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState(null);

    async function fetchData(player: string) {
        try {
            const response = await fetch('/api/v1/players/gameData', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ player }),
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            return data.payload;
        } catch (error) {
            // Handle any errors, e.g., log them or rethrow them if needed.
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    useEffect(() => {
        // Call fetchData when the component is mounted
        const fetchDataOnMount = async () => {
            try {
                const data = await fetchData(player);
                setPlayerData(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchDataOnMount(); // Call the function on mount
    }, [player]); // The empty dependency array ensures this runs only once on mount

    if (!playerData) return <div>Loading...</div>;

    if (playerData.status === 'error') {
        return <div>Error: {playerData.errorMessage}</div>;
    }

    // Specifies any specific columns and their styles for the table
    const namedColumns = [
        {
            Header: 'S',
            accessor: 'Season',
            Cell: ({ value }) => (
                <SeasonCell value={value} />
            ),
        },
        {
            Header: 'Club',
            accessor: 'Club',
            maxWidth: 50,
            align: 'center',
            Cell: ({ value }) => (
                <ClubCell value={value} />
            ),
        },
        {
            Header: 'Apps',
            accessor: 'Apps',
        }
        // Add more specific settings for other columns if needed
    ]

    return (
        // <div>Success</div>
        <ReactableTable columns={namedColumns} data={playerData.data} />
    );

};

export default GameReactable;
