import { Position } from 'components/playerForms/constants';
import { CreatePlayerFormValidation } from 'components/playerForms/shared';
import { GOALIE_ATTRIBUTE_COSTS, SKATER_ATTRIBUTE_COSTS } from 'lib/constants';
import { useMemo } from 'react';

const VALID_SKATER_ATTRIBUTES = [
  'screening',
  'gettingOpen',
  'passing',
  'puckhandling',
  'shootingAccuracy',
  'shootingRange',
  'offensiveRead',
  'checking',
  'hitting',
  'positioning',
  'stickchecking',
  'shotBlocking',
  'faceoffs',
  'defensiveRead',
  'acceleration',
  'agility',
  'balance',
  'speed',
  'stamina',
  'strength',
  'fighting',
  'aggression',
  'bravery',
];

const VALID_GOALIE_ATTRIBUTES = [
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
  'mentalToughness',
  'goaltenderStamina',
];

export const useGetAvailableTpe = <T extends Position>({
  position,
  totalTPE,
  attributes,
}: {
  position: T;
  totalTPE: number;
  attributes: T extends 'Goalie'
    ? CreatePlayerFormValidation['goalie']
    : CreatePlayerFormValidation['skater'];
}) =>
  useMemo(() => {
    if (position === 'Goalie') {
      return (
        totalTPE -
        Object.entries(attributes).reduce((tpe, [key, value]) => {
          if (!VALID_GOALIE_ATTRIBUTES.includes(key)) {
            return tpe;
          }

          if (isNaN(value) || (value < 5 && value > 20)) {
            return tpe;
          }

          return (
            tpe +
              GOALIE_ATTRIBUTE_COSTS[
                value as keyof typeof GOALIE_ATTRIBUTE_COSTS
              ]?.totalCost ?? 0
          );
        }, 0)
      );
    }
    return (
      totalTPE -
      Object.entries(attributes).reduce((tpe, [key, value]) => {
        if (!VALID_SKATER_ATTRIBUTES.includes(key)) {
          return tpe;
        }

        if (isNaN(value) || (value < 5 && value > 20)) {
          return tpe;
        }

        if (key === 'stamina') {
          return (
            tpe +
              SKATER_ATTRIBUTE_COSTS[
                value as keyof typeof GOALIE_ATTRIBUTE_COSTS
              ]?.stamCost ?? 0
          );
        }
        return (
          tpe +
            SKATER_ATTRIBUTE_COSTS[value as keyof typeof GOALIE_ATTRIBUTE_COSTS]
              ?.totalCost ?? 0
        );
      }, 0)
    );
  }, [position, totalTPE, attributes]);
