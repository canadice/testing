import React from "react";
import GameReactable from "../../components/datatables/DatatableGame";
import AttributePage from "../../components/attributes/AttributePage";
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
            {
                label: 'Player Build', content: <AttributePage
                    player={`${playerId}`}
                />
            },
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
