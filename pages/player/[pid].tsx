import { Alert, AlertIcon, AlertTitle, Button } from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PermissionGuard } from 'components/auth/PermissionGuard';
import { PageWrapper } from 'components/common/PageWrapper';
import { FullPlayerSheet } from 'components/playerForms/common/FullPlayerSheet';
import {
  AttributeChange,
  EditAttributesForm,
} from 'components/playerForms/editAttributes/EditAttributesForm';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useOtherPlayer } from 'hooks/useOtherPlayer';
import { useSeason } from 'hooks/useSeason';
import { GetServerSideProps } from 'next';
import { useCallback, useContext, useEffect, useState } from 'react';
import { GoalieAttributes, Player, SkaterAttributes } from 'typings';
import { mutate } from 'utils/query';

export default ({ playerId }: { playerId: number }) => {
  const { loggedIn, session } = useSession();
  const { season } = useSeason();
  const { player, loading } = useOtherPlayer(playerId);
  const [isRegressingPlayer, setIsRegressingPlayer] = useState<boolean>(false);
  const setIsRegressing = useCallback(() => {
    setIsRegressingPlayer(true);
  }, []);
  const queryClient = useQueryClient();
  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [isRegressingPlayer]);

  const updatePlayer = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/update', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const submitEdit = useCallback(
    async (
      changes: AttributeChange[],
      info: Partial<Player>,
      goalie?: Partial<GoalieAttributes>,
      skater?: Partial<SkaterAttributes>,
    ) =>
      updatePlayer.mutate(
        {
          type: 'Regression',
          changes,
          info,
          goalie,
          skater,
        },
        {
          onError: (e) => {
            addToast({
              title: `Changes not saved`,
              description: `We were unable to perform your regression. Please try again.`,
              status: 'error',
            });
            throw new Error(`error: ${e}`);
          },
          onSettled: () => {
            setIsRegressingPlayer(false);
            addToast({
              title: `Player successfully updated`,
              description: `Your attribute changes for your regressionhave been applied.`,
              status: 'success',
            });
            queryClient.invalidateQueries({ queryKey: ['otherPlayerInfo'] });
          },
        },
      ),
    [queryClient, addToast, updatePlayer],
  );

  return (
    <PageWrapper
      title={player?.name ?? 'Player'}
      className="flex flex-col"
      loading={loading}
    >
      {!player && (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon />
          <AlertTitle>Player Not Found</AlertTitle>
        </Alert>
      )}
      {player && (
        <>
          {isRegressingPlayer && loggedIn ? (
            <EditAttributesForm
              player={player}
              attributeFormType={'Regression'}
              season={season}
              onSubmitCallback={submitEdit}
              onCancel={() => setIsRegressingPlayer(false)}
            />
          ) : (
            <FullPlayerSheet
              player={player}
              attributeMenu={
                <>
                  {loggedIn && (
                    <PermissionGuard userPermissions="canHandlePlayerRegression">
                      <Button
                        isDisabled={
                          (player.appliedTPE ?? 0) <= (player.totalTPE ?? 0)
                        }
                        onClick={() => setIsRegressing()}
                      >
                        Regress
                      </Button>
                    </PermissionGuard>
                  )}
                </>
              }
              readOnly
            />
          )}
        </>
      )}
    </PageWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { pid } = query;

  return {
    props: {
      playerId: pid,
    },
  };
};
