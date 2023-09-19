import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useContext, useMemo, useState } from 'react';
import { Team, Player } from 'typings';
import { mutate, query } from 'utils/query';

import { ActionModal } from './common/ActionModal';

export const SendDown = ({
  teamID,
  shlTeams,
}: {
  teamID: number;
  league: number;
  shlTeams: Team[];
  smjhlTeams: Team[];
}) => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['playerSendDowns', teamID],
    queryFn: () => query(`api/v1/player?sendDownsForTeam=${teamID}`, undefined),
  });

  const submitTransaction = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/manager/transaction/send-down', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const teamNames = useMemo(
    () => ({
      old: shlTeams.find((team) => team.id === actionedPlayer?.currentTeamID)
        ?.name,
    }),
    [actionedPlayer?.currentTeamID, shlTeams],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submitTransaction.mutate(
      {
        pid: actionedPlayer?.pid,
        oldName: teamNames.old,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not send down ${actionedPlayer?.name}. Please verify they are eligible and try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${actionedPlayer?.name} successfully sent down to their SMJHL team.`,
            status: 'success',
          });
          setActionedPlayer(undefined);
          queryClient.invalidateQueries({ queryKey: ['playerSendDowns'] });
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
        actionConfig={{ action: 'Send Down', callback: setActionedPlayer }}
      />
      <ActionModal
        action="Send Down"
        player={actionedPlayer}
        setPlayer={setActionedPlayer}
        callback={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
