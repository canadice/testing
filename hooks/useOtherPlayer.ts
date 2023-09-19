import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { Player } from 'typings';
import { query } from 'utils/query';

export const useOtherPlayer = (
  pid: number,
): {
  player: Player | undefined;
  status: 'pending' | 'active' | 'retired' | 'denied' | undefined;
  loading: boolean;
} => {
  const { data: otherPlayer, isLoading: isLoadingPlayer } = useQuery<Player[]>({
    queryKey: ['otherPlayerInfo', pid],
    queryFn: () => query(`api/v1/player?pid=${pid}`),
  });

  const player = useMemo(() => otherPlayer?.[0] ?? undefined, [otherPlayer]);

  return useMemo(
    () => ({
      player,
      status: player?.status,
      loading: isLoadingPlayer,
    }),
    [player, isLoadingPlayer],
  );
};
