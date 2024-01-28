import { renderHook } from '@testing-library/react';
import { defaultPlayer } from 'components/playerForms/shared';
import { useGetAvailableTpe } from 'hooks/useCalculateAvailableTPE';
import {
  GOALIE_ATTRIBUTE_COSTS,
  SKATER_ATTRIBUTE_COSTS,
  STARTING_TPE,
} from 'lib/constants';
import { GoalieAttributes, SkaterAttributes } from 'typings';

const setupAttributes = (
  isGoalie: boolean,
  adjustedAttribute?: number,
  isStamina?: boolean,
) => {
  if (isGoalie) {
    return {
      ...defaultPlayer.goalie,
      blocker: adjustedAttribute ?? defaultPlayer.goalie.blocker,
    };
  } else {
    return {
      ...defaultPlayer.skater,
      screening: isStamina
        ? defaultPlayer.skater.screening
        : adjustedAttribute ?? defaultPlayer.skater.screening,
      stamina: isStamina
        ? adjustedAttribute ?? defaultPlayer.skater.stamina
        : defaultPlayer.skater.stamina,
    };
  }
};

describe('useGetAvailableTpe', () => {
  it(`should return ${STARTING_TPE} available TPE for a default skater build`, () => {
    const { result } = renderHook(() =>
      useGetAvailableTpe({
        position: 'Center',
        totalTPE: STARTING_TPE,
        attributes: setupAttributes(false) as unknown as SkaterAttributes,
      }),
    );
    expect(result.current).toEqual(STARTING_TPE);
  });

  it('should return proper available TPE when skater non-stamina attribute adjusted', () => {
    const { result } = renderHook(() =>
      useGetAvailableTpe({
        position: 'Center',
        totalTPE: STARTING_TPE,
        attributes: setupAttributes(
          false,
          defaultPlayer.skater.screening + 1,
        ) as unknown as SkaterAttributes,
      }),
    );
    expect(result.current).toEqual(
      STARTING_TPE -
        SKATER_ATTRIBUTE_COSTS[
          (defaultPlayer.skater.screening +
            1) as keyof typeof SKATER_ATTRIBUTE_COSTS
        ].pointCost,
    );
  });

  it('should return proper available TPE when skater stamina attribute adjusted', () => {
    const { result } = renderHook(() =>
      useGetAvailableTpe({
        position: 'Center',
        totalTPE: STARTING_TPE,
        attributes: setupAttributes(
          false,
          defaultPlayer.skater.stamina + 1,
          true,
        ) as unknown as SkaterAttributes,
      }),
    );
    expect(result.current).toEqual(
      STARTING_TPE -
        SKATER_ATTRIBUTE_COSTS[
          (defaultPlayer.skater.stamina +
            1) as keyof typeof SKATER_ATTRIBUTE_COSTS
        ].stamCost,
    );
  });

  it(`should return ${STARTING_TPE} available TPE for a default goalie build`, () => {
    const { result } = renderHook(() =>
      useGetAvailableTpe({
        position: 'Goalie',
        totalTPE: STARTING_TPE,
        attributes: setupAttributes(true) as unknown as GoalieAttributes,
      }),
    );
    expect(result.current).toEqual(STARTING_TPE);
  });

  it('should return proper available TPE when goalie attribute adjusted', () => {
    const { result } = renderHook(() =>
      useGetAvailableTpe({
        position: 'Goalie',
        totalTPE: STARTING_TPE,
        attributes: setupAttributes(
          true,
          defaultPlayer.goalie.blocker + 1,
        ) as unknown as GoalieAttributes,
      }),
    );

    expect(result.current).toEqual(
      STARTING_TPE -
        GOALIE_ATTRIBUTE_COSTS[
          (defaultPlayer.goalie.blocker +
            1) as keyof typeof GOALIE_ATTRIBUTE_COSTS
        ].pointCost,
    );
  });
});
