import { useQuery } from '@tanstack/react-query';
import { useSession } from 'contexts/AuthContext';
import config from 'lib/config';
import { useMemo } from 'react';
import { GeneralManager, Team } from 'typings';
import { query } from 'utils/query';

import { useCookie } from './useCookie';

export const useCurrentManagedTeam = (): {
  managedTeam: Team | undefined;
  loading: boolean;
} => {
  const { session, loggedIn } = useSession();
  const [userid] = useCookie(config.userIDCookieName);

  const { data: managerData, isLoading: isLoadingManagerData } = useQuery<
    Array<GeneralManager>
  >({
    queryKey: ['generalManagerInfo', session?.token, userid],
    queryFn: () =>
      query(`api/v1/manager?uid=${userid}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
    enabled: loggedIn && !!userid,
  });

  const manager = useMemo(
    () =>
      managerData?.find(
        (mgr) => mgr.gmID === Number(userid) || mgr.cogmID === Number(userid),
      ),
    [managerData, userid],
  );

  const { data: teamData, isLoading: isLoadingTeamData } = useQuery<Team[]>({
    queryKey: ['generalManagerTeamInfo', manager, manager?.leagueID],
    queryFn: () =>
      query(
        `/api/v1/teams?league=${manager?.leagueID ?? 0}`,
        {
          headers: {},
        },
        true,
      ),
    enabled: true,
  });

  const managedTeam = useMemo(
    () => teamData?.find((team) => team.id === manager?.teamID),
    [manager?.teamID, teamData],
  );

  return useMemo(
    () => ({
      managedTeam,
      loading: loggedIn ? isLoadingManagerData || isLoadingTeamData : false,
    }),
    [isLoadingManagerData, isLoadingTeamData, loggedIn, managedTeam],
  );
};
