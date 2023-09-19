import { Player } from 'typings';

import { AttributeTable } from './AttributeTable';

export const SkaterAttributeTable = ({ player }: { player: Player }) => {
  return (
    <>
      <AttributeTable
        header="Offensive Ratings"
        attributes={player.attributes}
        displayAttributes={[
          'screening',
          'gettingOpen',
          'passing',
          'puckhandling',
          'shootingAccuracy',
          'shootingRange',
          'offensiveRead',
        ]}
      />
      <AttributeTable
        header="Defensive Ratings"
        attributes={player.attributes}
        displayAttributes={[
          'checking',
          'hitting',
          'positioning',
          'stickchecking',
          'shotBlocking',
          'faceoffs',
          'defensiveRead',
        ]}
      />
      <AttributeTable
        header="Physical Ratings"
        attributes={player.attributes}
        displayAttributes={[
          'acceleration',
          'agility',
          'balance',
          'speed',
          'stamina',
          'strength',
          'fighting',
        ]}
      />
      <AttributeTable
        header="Mental Ratings"
        attributes={player.attributes}
        displayAttributes={[
          'aggression',
          'bravery',
          'determination',
          'teamPlayer',
          'leadership',
          'temperament',
          'professionalism',
        ]}
      />
    </>
  );
};
