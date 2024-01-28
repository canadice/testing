import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PlayerAchievement } from 'typings';
import { isValidID } from 'utils/isValidID';
import { query } from 'utils/query';

export const usePlayerAchievements = ({
  playerUpdateID,
  userID,
  season,
  teamID,
  leagueID,
  enabled,
}: {
  playerUpdateID?: number;
  userID?: number;
  season?: number;
  teamID?: number;
  leagueID?: number;
  enabled: boolean;
}): {
  playerAchievements: PlayerAchievement[];
  loading: boolean;
} => {
  const queryString = useMemo(() => {
    let queryStrings = [];

    if (isValidID(playerUpdateID)) {
      queryStrings.push(`pid=${playerUpdateID}`);
    }

    if (isValidID(userID)) {
      queryStrings.push(`uid=${userID}`);
    }

    if (season) {
      queryStrings.push(`season=${season}`);
    }

    if (isValidID(teamID)) {
      queryStrings.push(`teamID=${teamID}`);
    }

    if (isValidID(leagueID)) {
      queryStrings.push(`leagueID=${leagueID}`);
    }

    return queryStrings.join('&');
  }, [leagueID, playerUpdateID, season, teamID, userID]);

  const { data, isLoading } = useQuery<PlayerAchievement[]>({
    queryKey: ['playerAchievements', queryString],
    queryFn: () => query(`api/v1/history/player?${queryString}`),
    enabled: Boolean(queryString.length > 0 && enabled),
  });

  return {
    playerAchievements: data ?? [],
    loading: isLoading,
  };
};
