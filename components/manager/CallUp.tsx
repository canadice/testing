import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useContext, useMemo, useState } from 'react';
import { Team, Player } from 'typings';
import { mutate, query } from 'utils/query';

import { ActionModal } from './common/ActionModal';

export const CallUp = ({
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
  const queryClient = useQueryClient();

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['playerCallUps', teamID],
    queryFn: () =>
      query(
        `api/v1/player?leagueID=1&teamRightsID=${teamID}&status=active`,
        undefined,
      ),
  });

  const submitTransaction = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/manager/transaction/call-up', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const teamNames = useMemo(
    () => ({
      old: smjhlTeams.find((team) => team.id === actionedPlayer?.currentTeamID)
        ?.name,
      new: shlTeams.find((team) => team.id === teamID && team.league === league)
        ?.name,
    }),
    [actionedPlayer?.currentTeamID, league, shlTeams, smjhlTeams, teamID],
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submitTransaction.mutate(
      {
        pid: actionedPlayer?.pid,
        oldName: teamNames.old,
        newName: teamNames.new,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not complete call up for ${actionedPlayer?.name}. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${actionedPlayer?.name} successfully called up from the ${teamNames.old}.`,
            status: 'success',
          });
          setActionedPlayer(undefined);
          queryClient.invalidateQueries({ queryKey: ['playerCallUps'] });
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
        actionConfig={{ action: 'Call Up', callback: setActionedPlayer }}
      />
      <ActionModal
        action="Call Up"
        player={actionedPlayer}
        setPlayer={setActionedPlayer}
        callback={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
