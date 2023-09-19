import { useQuery } from '@tanstack/react-query';
import { useSession } from 'contexts/AuthContext';
import {
  CAN_START_NEXT_SEASON,
  CAN_ASSIGN_SHL_GM_ROLE,
  CAN_ASSIGN_SMJHL_GM_ROLE,
  CAN_APPROVE_PLAYERS,
  CAN_ADJUST_PLAYER_TPE,
  CAN_HANDLE_PLAYER_REGRESSION,
  CAN_HANDLE_TEAM_TRANSACTIONS,
  CAN_ASSIGN_PLAYER_IIHF_NATION,
  CAN_PROCESS_BANK_TRANSACTIONS,
  CAN_VIEW_PENDING_PLAYERS,
} from 'lib/constants';
import { userGroups } from 'lib/userGroups';
import { useMemo } from 'react';
import { query } from 'utils/query';

export type Permissions = {
  canStartNextSeason: boolean;
  canAssignSHLGMRole: boolean;
  canAssignSMJHLGMRole: boolean;
  canApprovePlayers: boolean;
  canAdjustPlayerTPE: boolean;
  canHandlePlayerRegression: boolean;
  canHandleTeamTransactions: boolean;
  canAssignPlayerIIHFNation: boolean;
  canProcessBankTransactions: boolean;
  canViewPendingPlayers: boolean;
};

const UNAUTHENTICATED_PERMISSIONS = {
  canStartNextSeason: false,
  canAssignSHLGMRole: false,
  canAssignSMJHLGMRole: false,
  canApprovePlayers: false,
  canAdjustPlayerTPE: false,
  canHandlePlayerRegression: false,
  canHandleTeamTransactions: false,
  canAssignPlayerIIHFNation: false,
  canProcessBankTransactions: false,
  canViewPendingPlayers: false,
};

export const usePermissions = (): {
  permissions: Partial<Permissions>;
  groups?: (keyof Readonly<typeof userGroups>)[];
  loading: boolean;
} => {
  const { session, loggedIn } = useSession();

  const { data, isLoading } = useQuery<{
    uid: number;
    groups: number[];
  }>({
    queryKey: ['userGroups', session?.token],
    queryFn: () =>
      query(`api/v1/user/permissions`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
    enabled: loggedIn,
  });

  const permissions = useMemo(() => {
    return {
      canStartNextSeason: data?.groups.some((group) =>
        CAN_START_NEXT_SEASON.map((role) => userGroups[role]).includes(group),
      ),
      canAssignSHLGMRole: data?.groups.some((group) =>
        CAN_ASSIGN_SHL_GM_ROLE.map((role) => userGroups[role]).includes(group),
      ),
      canAssignSMJHLGMRole: data?.groups.some((group) =>
        CAN_ASSIGN_SMJHL_GM_ROLE.map((role) => userGroups[role]).includes(
          group,
        ),
      ),
      canApprovePlayers: data?.groups.some((group) =>
        CAN_APPROVE_PLAYERS.map((role) => userGroups[role]).includes(group),
      ),
      canAdjustPlayerTPE: data?.groups.some((group) =>
        CAN_ADJUST_PLAYER_TPE.map((role) => userGroups[role]).includes(group),
      ),
      canHandlePlayerRegression: data?.groups.some((group) =>
        CAN_HANDLE_PLAYER_REGRESSION.map((role) => userGroups[role]).includes(
          group,
        ),
      ),
      canHandleTeamTransactions: data?.groups.some((group) =>
        CAN_HANDLE_TEAM_TRANSACTIONS.map((role) => userGroups[role]).includes(
          group,
        ),
      ),
      canAssignPlayerIIHFNation: data?.groups.some((group) =>
        CAN_ASSIGN_PLAYER_IIHF_NATION.map((role) => userGroups[role]).includes(
          group,
        ),
      ),
      canProcessBankTransactions: data?.groups.some((group) =>
        CAN_PROCESS_BANK_TRANSACTIONS.map((role) => userGroups[role]).includes(
          group,
        ),
      ),
      canViewPendingPlayers: data?.groups.some((group) =>
        CAN_VIEW_PENDING_PLAYERS.map((role) => userGroups[role]).includes(
          group,
        ),
      ),
    };
  }, [data?.groups]);

  const groups = useMemo(() => {
    return data?.groups.flatMap(
      (group) =>
        (Object.keys(userGroups).find(
          (key) =>
            userGroups[key as keyof Readonly<typeof userGroups>] === group,
        ) as keyof Readonly<typeof userGroups>) ?? [],
    );
  }, [data?.groups]);

  if (!loggedIn) {
    return {
      permissions: UNAUTHENTICATED_PERMISSIONS,
      groups: undefined,
      loading: true,
    };
  }

  return {
    permissions,
    groups,
    loading: isLoading,
  };
};
export { userGroups };
