import React from "react";
import GameReactable from "../../components/datatables/DatatableGame";
import Tabs from "../../components/common/Tabs";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

function PlayerPage() {
    // Gets the player name from the url
    const router = useRouter();
    const { playerId } = router.query;

    const [tabs, setTabs] = useState([]); // Initialize tabs as a state variable

    useEffect(() => {
        if (!playerId) {
            return;
        }

        const newTabs = [
            {
                label: 'Game Log',
                content:
                    <GameReactable
                        player={`${playerId}`}
                    />
            },
            // {
            //     label: 'Season Data', content: <SeasonDataReactable
            //         url={`${process.env.REACT_APP_PUBLIC_API_URL}/getPlayerStatistics?player=${playerName}&seasonTotal=TRUE`}
            //     />
            // },
            { label: 'Tab 3', content: 'This is the content of Tab 3.' },
        ];
        setTabs(newTabs);
    }, [playerId])

    return (
        <>
            <main className="h-full">
                <Tabs tabs={tabs} />
            </main>
        </>
    );
}

export default PlayerPage;
