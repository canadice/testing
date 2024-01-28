import { renderHook } from '@testing-library/react';
import { useGetCappedTPE } from 'hooks/useGetCappedTPE';
import { SMJHL_ROOKIE_CAP, SMJHL_SOPHOMORE_CAP } from 'lib/constants';
import { Player } from 'typings';

const setupPlayer = (
  draftSeason: number,
  totalTPE: number,
  appliedTPE: number,
  currentLeague?: 'SHL' | 'SMJHL',
) => {
  return {
    draftSeason,
    totalTPE,
    appliedTPE,
    currentLeague,
  } as unknown as Player;
};

const CURRENT_SEASON = 70;
const BELOW_ROOKIE_CAP = SMJHL_ROOKIE_CAP - 50;
const ABOVE_ROOKIE_CAP = SMJHL_ROOKIE_CAP + 50;
const BELOW_SOPHOMORE_CAP = SMJHL_SOPHOMORE_CAP - 50;
const ABOVE_SOPHOMORE_CAP = SMJHL_SOPHOMORE_CAP + 50;

describe('useGetCappedTPE', () => {
  it('should calculate totalTPE and isCappedTPE correctly when player is not provided', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(undefined, CURRENT_SEASON),
    );

    expect(result.current.totalTPE).toBe(0);
    expect(result.current.isCappedTPE).toBe(false);
  });

  it('should return total TPE and uncapped if no league and total TPE is lower than rookie cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(CURRENT_SEASON, BELOW_ROOKIE_CAP, BELOW_ROOKIE_CAP),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(BELOW_ROOKIE_CAP);
    expect(result.current.isCappedTPE).toBe(false);
  });

  it('should return total TPE and uncapped when league is SHL', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(
          CURRENT_SEASON + 1,
          ABOVE_SOPHOMORE_CAP,
          ABOVE_SOPHOMORE_CAP,
          'SHL',
        ),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(ABOVE_SOPHOMORE_CAP);
    expect(result.current.isCappedTPE).toBe(false);
  });

  it('should return total TPE and uncapped if season is less than draft season and total TPE is less than rookie cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(CURRENT_SEASON - 1, BELOW_ROOKIE_CAP, BELOW_ROOKIE_CAP),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(BELOW_ROOKIE_CAP);
    expect(result.current.isCappedTPE).toBe(false);
  });

  it('should return total TPE and uncapped if season equal to draft season and total TPE is less than rookie cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(CURRENT_SEASON, BELOW_ROOKIE_CAP, BELOW_ROOKIE_CAP),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(BELOW_ROOKIE_CAP);
    expect(result.current.isCappedTPE).toBe(false);
  });

  it('should return rookie cap and capped if season is less than draft season, total TPE is higher than rookie cap and applied is at cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(CURRENT_SEASON + 1, ABOVE_ROOKIE_CAP, SMJHL_ROOKIE_CAP),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(SMJHL_ROOKIE_CAP);
    expect(result.current.isCappedTPE).toBe(true);
  });

  it('should return rookie cap and capped if season is equal to draft season, total TPE is higher than rookie cap and applied is at cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(CURRENT_SEASON, ABOVE_ROOKIE_CAP, SMJHL_ROOKIE_CAP),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(SMJHL_ROOKIE_CAP);
    expect(result.current.isCappedTPE).toBe(true);
  });

  it('should return total TPE and uncapped if season is greater than draft season and total TPE is less than sophomore cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(
          CURRENT_SEASON - 1,
          BELOW_SOPHOMORE_CAP,
          BELOW_SOPHOMORE_CAP,
          'SMJHL',
        ),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(BELOW_SOPHOMORE_CAP);
    expect(result.current.isCappedTPE).toBe(false);
  });

  it('should return sophomore cap and capped if season is greater than draft season, total TPE is more than sophomore cap and applied is at cap', () => {
    const { result } = renderHook(() =>
      useGetCappedTPE(
        setupPlayer(
          CURRENT_SEASON - 1,
          ABOVE_SOPHOMORE_CAP,
          SMJHL_SOPHOMORE_CAP,
          'SMJHL',
        ),
        CURRENT_SEASON,
      ),
    );

    expect(result.current.totalTPE).toBe(SMJHL_SOPHOMORE_CAP);
    expect(result.current.isCappedTPE).toBe(true);
  });
});
