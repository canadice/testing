import { useQuery } from '@tanstack/react-query';
import { useSession } from 'contexts/AuthContext';
import config from 'lib/config';
import { useMemo } from 'react';
import { Player } from 'typings';
import { query } from 'utils/query';

import { useCookie } from './useCookie';

export const useCurrentPlayer = (): {
  player: Player | undefined;
  canUnretire: boolean;
  status: 'pending' | 'active' | 'retired' | 'denied' | undefined;
  loading: boolean;
} => {
  const { session, loggedIn } = useSession();
  const [userid] = useCookie(config.userIDCookieName);

  const { data: playerData, isLoading: isLoadingPlayer } = useQuery<Player[]>({
    queryKey: ['myPlayerInfo', session?.token, userid],
    queryFn: () =>
      query(`api/v1/player?uid=${userid}`, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
    enabled: loggedIn && !!userid,
  });

  const canUnretire = useMemo(() => {
    const player = playerData?.find((player) => {
      if (
        player.retirementDate !== undefined &&
        player.retirementDate !== null &&
        player.status === 'retired'
      ) {
        const retirementDate = new Date(player.retirementDate);
        const oneWeekAfter = new Date(
          retirementDate.getFullYear(),
          retirementDate.getMonth(),
          retirementDate.getDate() + 7,
        );
        const today = new Date();
        if (today < oneWeekAfter) {
          return player;
        }
      }
    });

    return Boolean(player);
  }, [playerData]);

  const player = useMemo(() => playerData?.[0], [playerData]);

  return useMemo(
    () => ({
      player,
      canUnretire,
      status: player?.status,
      loading: loggedIn ? isLoadingPlayer : false,
    }),
    [player, isLoadingPlayer, loggedIn, canUnretire],
  );
};
