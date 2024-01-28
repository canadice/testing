import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { TeamAchievement } from 'typings';
import { isValidID } from 'utils/isValidID';
import { query } from 'utils/query';

export const useTeamAchievements = ({
  season,
  teamID,
  leagueID,
  enabled,
}: {
  season?: number;
  teamID?: number;
  leagueID?: number;
  enabled: boolean;
}): {
  teamAchievements: TeamAchievement[];
  loading: boolean;
} => {
  const queryString = useMemo(() => {
    let queryStrings = [];

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
  }, [leagueID, season, teamID]);

  const { data, isLoading } = useQuery<TeamAchievement[]>({
    queryKey: ['teamAchievements', queryString],
    queryFn: () => query(`api/v1/history/team?${queryString}`),
    enabled: Boolean(queryString.length > 0 && enabled),
  });

  return {
    teamAchievements: data ?? [],
    loading: isLoading,
  };
};
