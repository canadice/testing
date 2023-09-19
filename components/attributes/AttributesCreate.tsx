import AttributeBox from "./AttributeBox";

const AttributeCreate = (position: string) => {
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

    const data = {
        'Acceleration': 5,
        'Agility': 5,
        'Balance': 5,
        'Jumping Reach': 5,
        'Natural Fitness': 20,
        'Pace': 5,
        'Stamina': 20,
        'Strength': 5,
        'Aggression': 5,
        'Anticipation': 5,
        'Bravery': 5,
        'Composure': 5,
        'Concentration': 5,
        'Decisions': 5,
        'Determination': 5,
        'Flair': 5,
        'Leadership': 5,
        'Off the Ball': 5,
        'Positioning': 5,
        'Team Work': 5,
        'Vision': 5,
        'Work Rate': 5,
        'Corners': 5,
        'Crossing': 5,
        'Dribbling': 5,
        'Finishing': 5,
        'First Touch': 5,
        'Free Kick': 5,
        'Heading': 5,
        'Long Shots': 5,
        'Long Throws': 5,
        'Marking': 5,
        'Passing': 5,
        'Penalty Taking': 5,
        'Tackling': 5,
        'Technique': 5,
        'Aerial Reach': 5,
        'Command of Area': 5,
        'Communication': 5,
        'Eccentricity': 5,
        'Handling': 5,
        'Kicking': 5,
        'One on Ones': 5,
        'Reflexes': 5,
        'Rushing Out': 5,
        'Punching': 5,
        'Throwing': 5,
    };

    // Get the filtered object with specific keys
    const physicalData = filterKeysFromArray(data, physicalKeys);
    const mentalData = filterKeysFromArray(data, mentalKeys);
    const technicalData = filterKeysFromArray(data, technicalKeys);
    const keeperData = filterKeysFromArray(data, keeperKeys);

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

    return (
        <div className='attribute-container'>
            <Boxes data={physicalData} header="Physical" />
            <Boxes data={mentalData} header="Mental" />
            {position.position === "goalkeeper" ?
                <Boxes data={keeperData} header="Goalkeeping" /> :
                <Boxes data={technicalData} header="Technical" />}
        </div >

    );
}

export default AttributeCreate;