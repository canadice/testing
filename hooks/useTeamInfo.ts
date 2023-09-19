import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Team } from 'typings';
import { query } from 'utils/query';

export const useTeamInfo = (
  currentLeague?: 'SHL' | 'SMJHL' | null,
  currentTeamID?: number | null,
  shlRightsTeamID?: number | null,
): {
  shlTeams: Team[];
  smjhlTeams: Team[];
  currentTeam: Team | undefined;
  shlRightsTeam: Team | undefined;
  currentLeague: 'shl' | 'smjhl' | undefined;
  loading: boolean;
} => {
  const { data: shlData, isLoading: shlDataLoading } = useQuery<Team[]>({
    queryKey: ['shlTeamInfo', currentLeague, currentTeamID],
    queryFn: () => query('/api/v1/teams?league=0', { headers: {} }, true),
    enabled: true,
    staleTime: Infinity,
  });

  const { data: smjhlData, isLoading: smjhlDataLoading } = useQuery<Team[]>({
    queryKey: ['smjhlTeamInfo', currentLeague, currentTeamID],
    queryFn: () => query('/api/v1/teams?league=1', { headers: {} }, true),
    enabled: true,
    staleTime: Infinity,
  });

  const mappedCurrentLeague = useMemo(() => {
    switch (currentLeague) {
      case 'SMJHL':
        return 'smjhl';
      case 'SHL':
        return 'shl';
      default:
        return undefined;
    }
  }, [currentLeague]);

  const currentTeam = useMemo(() => {
    const currentLeagueData =
      currentLeague === 'SHL' || !currentLeague ? shlData : smjhlData;
    const teamData = currentLeagueData?.filter(
      (team) => team.id === currentTeamID,
    );
    if (teamData && teamData.length > 0) {
      return teamData[0];
    }

    return undefined;
  }, [currentLeague, currentTeamID, shlData, smjhlData]);

  const shlRightsTeam = useMemo(() => {
    const teamData = shlData?.filter((team) => team.id === shlRightsTeamID);
    if (teamData && teamData.length > 0) {
      return teamData[0];
    }

    return undefined;
  }, [shlRightsTeamID, shlData]);

  return {
    shlTeams: shlData ?? [],
    smjhlTeams: smjhlData ?? [],
    shlRightsTeam,
    currentTeam,
    currentLeague: mappedCurrentLeague,
    loading: shlDataLoading || smjhlDataLoading,
  };
};
