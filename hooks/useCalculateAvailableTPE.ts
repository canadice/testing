import { Position } from 'components/playerForms/constants';
import { CreatePlayerFormValidation } from 'components/playerForms/shared';
import { KEEPER_ATTRIBUTE_COSTS, OUTFIELD_ATTRIBUTE_COSTS } from 'lib/constants';
import { useMemo } from 'react';

const VALID_OUTFIELD_ATTRIBUTES = [
    'acceleration',
    'agility',
    'balance',
    'jumpingReach',
    'naturalFitness',
    'pace',
    'stamina',
    'strength',
    'aggression',
    'anticipation',
    'bravery',
    'composure',
    'concentration',
    'decisions',
    'determination',
    'flair',
    'leadership',
    'offTheBall',
    'positioning',
    'teamWork',
    'vision',
    'workRate',
    'corners',
    'crossing',
    'dribbling',
    'finishing',
    'firstTouch',
    'freeKick',
    'heading',
    'longShots',
    'longThrows',
    'marking',
    'passing',
    'penaltyTaking',
    'tackling',
    'technique',
];

const VALID_KEEPER_ATTRIBUTES = [
    'acceleration',
    'agility',
    'balance',
    'jumpingReach',
    'naturalFitness',
    'pace',
    'stamina',
    'strength',
    'aggression',
    'anticipation',
    'bravery',
    'composure',
    'concentration',
    'decisions',
    'determination',
    'flair',
    'leadership',
    'offTheBall',
    'positioning',
    'teamWork',
    'vision',
    'workRate',
    'aerialReach',
    'commandOfArea',
    'communication',
    'eccentricity',
    'handling',
    'kicking',
    'oneOnOnes',
    'reflexes',
    'tendencyToRush',
    'tendencyToPunch',
    'throwing',
    'firstTouch',
    'freeKick',
    'passing',
    'penaltyTaking',
    'technique'
];

export const useGetAvailableTpe = <T extends Position>({
    position,
    totalTPE,
    attributes,
}: {
    position: T;
    totalTPE: number;
    attributes: T extends 'Keeper'
    ? CreatePlayerFormValidation['keeper']
    : CreatePlayerFormValidation['outfield'];
}) =>
    useMemo(() => {
        if (position === 'Keeper') {
            return (
                totalTPE -
                Object.entries(attributes).reduce((tpe, [key, value]) => {
                    if (!VALID_KEEPER_ATTRIBUTES.includes(key)) {
                        return tpe;
                    }

                    if (isNaN(value) || (value < 5 && value > 20)) {
                        return tpe;
                    }

                    return (
                        tpe +
                        KEEPER_ATTRIBUTE_COSTS[
                            value as keyof typeof KEEPER_ATTRIBUTE_COSTS
                        ]?.totalCost ?? 0
                    );
                }, 0)
            );
        }
        return (
            totalTPE -
            Object.entries(attributes).reduce((tpe, [key, value]) => {
                if (!VALID_OUTFIELD_ATTRIBUTES.includes(key)) {
                    return tpe;
                }

                if (isNaN(value) || (value < 5 && value > 20)) {
                    return tpe;
                }

                if (key === 'stamina') {
                    return (
                        tpe +
                        OUTFIELD_ATTRIBUTE_COSTS[
                            value as keyof typeof KEEPER_ATTRIBUTE_COSTS
                        ]?.stamCost ?? 0
                    );
                }
                return (
                    tpe +
                    OUTFIELD_ATTRIBUTE_COSTS[value as keyof typeof KEEPER_ATTRIBUTE_COSTS]
                        ?.totalCost ?? 0
                );
            }, 0)
        );
    }, [position, totalTPE, attributes]);