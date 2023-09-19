import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { UpdateEvents } from 'typings';
import { query } from 'utils/query';

export type UpdateFlags = {
  positionPending: boolean;
  namePending: boolean;
  usernamePending: boolean;
  renderPending: boolean;
  retirementProcessed: boolean;
  unRetirementProcessed: boolean;
};

export const useUpdateEvents = (
  playerUpdateId?: number,
): {
  updateEvents: UpdateEvents[];
  updateFlags: UpdateFlags;
  loading: boolean;
} => {
  const { data, isLoading } = useQuery<UpdateEvents[]>({
    queryKey: ['updateEvents', playerUpdateId],
    queryFn: () => query(`api/v1/updateevents?pid=${playerUpdateId}`),
    enabled: playerUpdateId !== undefined,
  });

  const updateFlags = useMemo(() => {
    return {
      positionPending: Boolean(
        data?.some(
          (update) =>
            update.attributeChanged === 'Position' &&
            update.status === 'pending',
        ),
      ),
      namePending: Boolean(
        data?.some(
          (update) =>
            update.attributeChanged === 'Name' && update.status === 'pending',
        ),
      ),
      usernamePending: Boolean(
        data?.some(
          (update) =>
            update.attributeChanged === 'Username' &&
            update.status === 'pending',
        ),
      ),
      renderPending: Boolean(
        data?.some(
          (update) =>
            update.attributeChanged === 'Render' && update.status === 'pending',
        ),
      ),
      retirementProcessed: Boolean(
        data?.some(
          (update) =>
            update.attributeChanged === 'status' &&
            update.newValue === 'retired',
        ),
      ),
      unRetirementProcessed: Boolean(
        data?.some(
          (update) =>
            update.attributeChanged === 'status' &&
            update.oldValue === 'retired',
        ),
      ),
    };
  }, [data]);

  return useMemo(
    () => ({
      updateEvents: data ?? [],
      updateFlags,
      loading: isLoading,
    }),
    [data, isLoading, updateFlags],
  );
};
