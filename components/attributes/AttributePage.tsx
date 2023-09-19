import React, { useState, useEffect } from "react";
import AttributeBox from "./AttributeBox";

const AttributePage = ({ player }) => {
    const [playerData, setPlayerData] = useState(null);
    const [error, setError] = useState(null);

    async function fetchData(player: string) {
        try {
            const response = await fetch('/api/v1/players/playerData', {
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
    if (playerData.status === 'error') return <div>Error: {error.message}</div>;

    const filterKeysFromArray = (data, keysToFilter) => {
        return keysToFilter.reduce((filteredObject, key) => {
            if (data.hasOwnProperty(key)) {
                filteredObject[key] = data[key];
            }
            return filteredObject;
        }, {});
    };

    // Array of specific key names to filter
    const mentalKeys = [
        "Aggression",
        "Anticipation",
        "Bravery",
        "Composure",
        "Concentration",
        "Decisions",
        "Determination",
        "Flair",
        "Leadership",
        "Off the Ball",
        "Positioning",
        "Teamwork",
        "Vision",
        "Work Rate",
    ];

    // Array of specific key names to filter
    const physicalKeys = [
        "Acceleration",
        "Agility",
        "Balance",
        "Bravery",
        "Jumping Reach",
        "Natural Fitness",
        "Stamina",
        "Strength",
    ];

    // Array of specific key names to filter
    const technicalKeys = [
        "Corners",
        "Crossing",
        "Dribbling",
        "Finishing",
        "First Touch",
        "Free Kick",
        "Heading",
        "Long Shots",
        "Long Throws",
        "Marking",
        "Passing",
        "Penalty Taking",
        "Tackling",
        "Technique",
    ];

    // Array of specific key names to filter
    const keeperKeys = [
        "Aerial Reach",
        "Command of Area",
        "Communication",
        "Eccentricity",
        "Handling",
        "Kicking",
        "One on Ones",
        "Reflexes",
        "Tendency to Rush",
        "Tendency to Punch",
        "Throwing",
        "First Touch",
        "Free Kick",
        "Passing",
        "Penalty Taking",
        "Technique",
    ];


    const attributeDataText = {
        'Acceleration': "The player's ability to quickly reach their top speed.",
        'Agility': "The player's ability to quickly change direction in their movement.",
        'Balance': "The player's ability to hold their balance when being subjected to physical pressure.",
        'Jumping Reach': "The maximum height a player can reach when jumping.",
        'Natural Fitness': "Locked at 20.",
        'Pace': "The player's top speed.",
        'Stamina': "Locked at 20.",
        'Strength': "The player's ability to put physical pressure on another player.",
        'Aggression': 'The likelihood of the player to get into physical situations and the amount of force they use.',
        'Anticipation': 'The player\'s ability to anticipate teammates\' and opposition movements and actions.',
        'Bravery': 'The willingness of the player to get into areas where they risk an injury.',
        'Composure': 'The player\'s ability to remain unaffected while being under mental pressure.',
        'Concentration': 'The player\'s ability to keep focus later in the game.',
        'Decisions': 'The player\'s ability to decide the best action to perform throughout a game.',
        'Determination': 'The willingness of the player to try and perform even when their team is losing or the player is not performing well.',
        'Flair': 'The player\'s ability to do something unexpected with the ball.',
        'Leadership': 'How inspirational and motivational a player is to their teammates.',
        'Off the Ball': 'The player\'s ability to do position themselves while their team has possession (Offensive).',
        'Positioning': 'The player\'s ability to position themselves while the opposing team has possession (Defensive).',
        'Team Work': 'The player\'s ability to follow tactical instructions and the positions of other players on the pitch.',
        'Vision': 'The player\'s ability to see what opportunities exist while in possession of the ball.',
        'Work Rate': 'The player\'s amount of physical effort that is used during the match.',
        'Corners': 'The player\'s ability to hit the intended target off a corner.',
        'Crossing': 'The player\'s ability to hit the intended target when crossing the ball from the wide areas of the pitch.',
        'Dribbling': 'The player\'s ability to control the ball while moving.',
        'Finishing': 'The player\'s ability to hit the intended target of the goal with a shot.',
        'First Touch': 'The player\'s ability to control and set up the ball after receiving it.',
        'Free Kick': 'The player\'s ability to hit the intended target with a free kick.',
        'Heading': 'The player\'s ability to hit the intended target with a header.',
        'Long Shots': 'The player\'s ability to hit the intended target with a shot from outside the opposition\'s penalty area.',
        'Long Throws': 'The length a player can throw the ball and the player\'s ability to hit the intended target with a long throw.',
        'Marking': 'The player\'s ability to mark an opponent.',
        'Passing': 'The player\'s ability to hit their intended target with a pass.',
        'Penalty Taking': 'The player\'s ability to hit their intended target on a penalty kick.',
        'Tackling': 'The player\'s ability to get the ball from the opponent without incurring a foul.',
        'Technique': 'The player\'s ability to successfully perform advanced technical actions.',
        'Aerial Reach': 'The height a goalkeeper can reach when jumping. Equivalent to outfielders Jumping Reach.',
        'Command of Area': 'The ability to take control of balls in the box.',
        'Communication': 'The ability to communicate with teammates and control the defensive organization.',
        'Eccentricity': 'The likelihood to do something unexpected or risky.',
        'Handling': 'The ability to keep control of the ball when catching it.',
        'Kicking': 'The maximum length of a kick.',
        'One on Ones': 'The ability to perform well when alone with an opponent.',
        'Reflexes': 'The ability to react to shots.',
        'Rushing Out': 'The ability to assess when to rush out.',
        'Punching': 'The likelihood to punch instead of catching the ball.',
        'Throwing': 'The ability to hit the intended target when throwing the ball.',
    };



    // Get the filtered object with specific keys
    const physicalData = filterKeysFromArray(playerData[0], physicalKeys);
    const mentalData = filterKeysFromArray(playerData[0], mentalKeys);
    const technicalData = filterKeysFromArray(playerData[0], technicalKeys);
    const keeperData = filterKeysFromArray(playerData[0], keeperKeys);

    const Boxes = ({ data, header }) => {
        return (
            <div>
                <div>
                    <h3>{header}</h3>
                </div>
                <div className="attribute-class-container">
                    {Object.entries(data).map(([key, value]) => (
                        <AttributeBox data={{ key, value, text: attributeDataText[key] }} editable={true} />
                    ))}
                </div>
            </div>
        )
    }

    // const outfieldOrKeeper = ({ condition }) => {
    //     return (
    //         <div>
    //             {condition ? {
    //                 Object.entries(techniqueData).map(([key, value]) => (
    //                     <AttributeBox data={{ key, value, text: attributeDataText[key] }} editable={true} />
    //                 ))
    //             } : 
    //         </div>
    //     );
    // };

    return (
        <div className='attribute-container'>
            <Boxes data={physicalData} header="Physical" />
            <Boxes data={mentalData} header="Mental" />
            {playerData[0].PreferredPosition === "GK" ?
                <Boxes data={keeperData} header="Goalkeeping" /> :
                <Boxes data={technicalData} header="Technical" />}
        </div >

    );

}

export default AttributePage;


