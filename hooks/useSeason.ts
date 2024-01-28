import { useQuery } from '@tanstack/react-query';
import { SHL_GENERAL_DISCORD } from 'lib/constants';
import { useMemo } from 'react';
import { Seasons } from 'typings';
import { query } from 'utils/query';

export const useSeason = (): {
  season: number;
  startDate: string;
  ended: boolean;
  discord: string;
  nextDiscord: string;
  loading: boolean;
} => {
  const { data: seasonData, isLoading: isLoadingSeason } = useQuery<Seasons>({
    queryKey: ['currentSeason'],
    queryFn: () =>
      query(`api/v1/season`, {
        headers: {},
      }),
  });

  const currentSeason = useMemo(() => seasonData, [seasonData]);

  return useMemo(
    () => ({
      loading: isLoadingSeason,
      season: currentSeason?.season ?? 0,
      startDate: currentSeason?.startDate ?? '',
      discord: currentSeason?.discord ?? SHL_GENERAL_DISCORD,
      nextDiscord: currentSeason?.nextDiscord ?? SHL_GENERAL_DISCORD,
      ended: !!currentSeason?.ended,
    }),
    [currentSeason, isLoadingSeason],
  );
};
