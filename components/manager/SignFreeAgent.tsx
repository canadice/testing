import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useSeason } from 'hooks/useSeason';
import { useContext, useMemo, useState } from 'react';
import { Team, Player } from 'typings';
import { mutate, query } from 'utils/query';

import { ActionModal } from './common/ActionModal';

export const SignFreeAgent = ({
  teamID,
  league,
  shlTeams,
  smjhlTeams,
}: {
  teamID: number;
  league: number;
  shlTeams: Team[];
  smjhlTeams: Team[];
}) => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const { season, loading: seasonLoading } = useSeason();
  const queryClient = useQueryClient();

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['playerFreeAgents', league, season],
    queryFn: () =>
      query(
        `api/v1/player?teamID=ufa${
          league === 1
            ? `&minSeason=${season - 2}&maxAppliedTPE=425`
            : `&maxSeason=${season}`
        }`,
        undefined,
      ),
    enabled: !seasonLoading,
  });

  const submitTransaction = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/manager/transaction/free-agent', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const teamNames = useMemo(
    () => ({
      new:
        league === 0
          ? shlTeams.find((team) => team.id === teamID)?.name
          : smjhlTeams.find((team) => team.id === teamID)?.name,
    }),
    [league, shlTeams, smjhlTeams, teamID],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submitTransaction.mutate(
      {
        pid: actionedPlayer?.pid,
        newName: teamNames.new,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not sign ${actionedPlayer?.name} as a free agent. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${actionedPlayer?.name} successfully added via free agency.`,
            status: 'success',
          });
          setActionedPlayer(undefined);
          queryClient.invalidateQueries({ queryKey: ['playerFreeAgents'] });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <>
      <PlayerTable
        data={data ?? []}
        linkTarget="_blank"
        isLoading={isLoading}
        actionConfig={{ action: 'Sign', callback: setActionedPlayer }}
      />
      <ActionModal
        action="Sign"
        player={actionedPlayer}
        setPlayer={setActionedPlayer}
        callback={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
