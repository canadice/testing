import { useQuery } from '@tanstack/react-query';
import { TPEEvent } from 'typings';
import { query } from 'utils/query';

export const useTPEEvents = (
  playerUpdateId?: number,
): {
  tpeEvents: Partial<TPEEvent>[];
  loading: boolean;
} => {
  const { data, isLoading } = useQuery<TPEEvent[]>({
    queryKey: ['tpeEvents', playerUpdateId],
    queryFn: () => query(`api/v1/tpeevents?pid=${playerUpdateId}`),
    enabled: playerUpdateId !== undefined,
  });

  return {
    tpeEvents: data ?? [],
    loading: isLoading,
  };
};
