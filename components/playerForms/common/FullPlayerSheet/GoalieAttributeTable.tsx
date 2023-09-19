import { Player } from 'typings';

import { AttributeTable } from './AttributeTable';

export const GoalieAttributeTable = ({ player }: { player: Player }) => {
  return (
    <>
      <AttributeTable
        header="Goalie Ratings"
        attributes={player.attributes}
        displayAttributes={[
          'blocker',
          'glove',
          'passing',
          'pokeCheck',
          'positioning',
          'rebound',
          'recovery',
          'puckhandling',
          'lowShots',
          'reflexes',
          'skating',
        ]}
      />
      <AttributeTable
        header="Mental Ratings"
        attributes={player.attributes}
        displayAttributes={[
          'aggression',
          'mentalToughness',
          'determination',
          'teamPlayer',
          'leadership',
          'goaltenderStamina',
          'professionalism',
        ]}
      />
    </>
  );
};
