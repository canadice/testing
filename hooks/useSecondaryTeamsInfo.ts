import { useQuery } from '@tanstack/react-query';
import { Team } from 'typings';
import { query } from 'utils/query';

export const useSecondaryTeamsInfo = (): {
  iihfTeams: Team[];
  wjcTeams: Team[];
  loading: boolean;
} => {
  const { data: iihfData, isLoading: iihfDataLoading } = useQuery<Team[]>({
    queryKey: ['iihfTeamInfo'],
    queryFn: () => query('/api/v1/teams?league=2', { headers: {} }, true),
    enabled: true,
    staleTime: Infinity,
  });

  const { data: wjcData, isLoading: wjcDataLoading } = useQuery<Team[]>({
    queryKey: ['wjcTeamInfo'],
    queryFn: () => query('/api/v1/teams?league=3', { headers: {} }, true),
    enabled: true,
    staleTime: Infinity,
  });

  return {
    iihfTeams: iihfData ?? [],
    wjcTeams: wjcData ?? [],
    loading: iihfDataLoading || wjcDataLoading,
  };
};
