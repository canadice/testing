import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubHeading } from 'components/common/SubHeading';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useContext, useMemo, useState } from 'react';
import { Team, Player } from 'typings';
import { mutate, query } from 'utils/query';

import { ActionModal } from './common/ActionModal';

export const Release = ({
  teamID,
  league,
  shlTeams,
}: {
  teamID: number;
  league: number;
  shlTeams: Team[];
}) => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['playerReleases', teamID, league],
    queryFn: () =>
      query(`api/v1/player?teamID=${teamID}&leagueID=${league}`, undefined),
  });

  const { data: prospectData } = useQuery<Player[]>({
    queryKey: ['playerProspectReleases', teamID, league],
    queryFn: () =>
      query(`api/v1/player?teamRightsID=${teamID}&notLeagueID=0`, undefined),
    enabled: league === 0,
  });

  const submitChangeRequest = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/manager/transaction/release', variables, {
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
    submitChangeRequest.mutate(
      {
        pid: actionedPlayer?.pid,
        oldName: teamNames.old,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not release ${actionedPlayer?.name}. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${actionedPlayer?.name} successfully released.`,
            status: 'success',
          });
          setActionedPlayer(undefined);
          queryClient.invalidateQueries({ queryKey: ['playerReleases'] });
          queryClient.invalidateQueries({
            queryKey: ['playerProspectReleases'],
          });
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
        actionConfig={{ action: 'Release', callback: setActionedPlayer }}
      />
      {league === 0 && (
        <>
          <SubHeading className="mt-8 mb-2">Prospects</SubHeading>
          <PlayerTable
            data={prospectData ?? []}
            linkTarget="_blank"
            isLoading={isLoading}
            actionConfig={{ action: 'Release', callback: setActionedPlayer }}
          />
        </>
      )}
      <ActionModal
        action="Release"
        player={actionedPlayer}
        setPlayer={setActionedPlayer}
        callback={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
