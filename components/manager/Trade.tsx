import { Select } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SubHeading } from 'components/common/SubHeading';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Team, Player } from 'typings';
import { mutate, query } from 'utils/query';

import { ActionModal } from './common/ActionModal';

export const Trade = ({
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
  const [tradeTeamID, setTradeTeamID] = useState<number | undefined>();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const teamData = useMemo(
    () => (league === 0 ? shlTeams : smjhlTeams),
    [league, shlTeams, smjhlTeams],
  );

  useEffect(() => {
    if (!actionedPlayer) {
      setTradeTeamID(undefined);
    }
  }, [actionedPlayer]);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['playerTrades', teamID, league],
    queryFn: () =>
      query(`api/v1/player?teamID=${teamID}&leagueID=${league}`, undefined),
  });

  const { data: prospectData } = useQuery<Player[]>({
    queryKey: ['playerProspectTrades', teamID, league],
    queryFn: () => query(`api/v1/player?teamRightsID=${teamID}`, undefined),
    enabled: league === 0,
  });

  const submitTransaction = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/manager/transaction/trade', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const teamNames = useMemo(
    () => ({
      old:
        league === 0
          ? shlTeams.find((team) => team.id === teamID)?.name
          : smjhlTeams.find((team) => team.id === teamID)?.name,
      new:
        league === 0
          ? shlTeams.find((team) => team.id === tradeTeamID)?.name
          : smjhlTeams.find((team) => team.id === tradeTeamID)?.name,
    }),
    [league, shlTeams, smjhlTeams, teamID, tradeTeamID],
  );

  const handleSubmit = async () => {
    if (!tradeTeamID) {
      addToast({
        title: `No Team Selected`,
        description: `Select a team to trade this player to.`,
        status: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    submitTransaction.mutate(
      {
        pid: actionedPlayer?.pid,
        teamID: tradeTeamID,
        newName: teamNames.new,
        oldName: teamNames.old,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not complete trade with ${actionedPlayer?.name}. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${actionedPlayer?.name} successfully traded to the ${teamNames.new}.`,
            status: 'success',
          });
          setActionedPlayer(undefined);
          queryClient.invalidateQueries({ queryKey: ['playerTrades'] });
          queryClient.invalidateQueries({ queryKey: ['playerProspectTrades'] });
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
        actionConfig={{ action: 'Trade', callback: setActionedPlayer }}
      />
      {league === 0 && (
        <>
          <SubHeading className="mt-8 mb-2">Prospects</SubHeading>
          <PlayerTable
            data={prospectData ?? []}
            linkTarget="_blank"
            isLoading={isLoading}
            actionConfig={{ action: 'Trade', callback: setActionedPlayer }}
          />
        </>
      )}
      <ActionModal
        action="Trade"
        player={actionedPlayer}
        setPlayer={setActionedPlayer}
        callback={handleSubmit}
        isSubmitting={isSubmitting}
      >
        <Select
          className="mt-4"
          placeholder="Select Trade Team"
          name="Select Trade Team"
          onChange={(e) => setTradeTeamID(Number(e.currentTarget.value))}
        >
          {teamData?.map((team) => {
            if (team.id !== actionedPlayer?.currentTeamID) {
              return (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              );
            }
          })}
        </Select>
      </ActionModal>
    </>
  );
};
