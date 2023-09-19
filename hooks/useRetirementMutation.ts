import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useCallback, useContext, useState } from 'react';
import { mutate } from 'utils/query';

export const useRetirementMutation = (
  playerUpdateID: number | undefined,
  type: 'retire' | 'unretire',
) => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const retirePlayer = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/retire', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitRetire = useCallback(async () => {
    setIsSubmitting(true);
    retirePlayer.mutate(
      {
        playerUpdateID,
      },
      {
        onError: () => {
          addToast({
            title: `Player not ${type}d`,
            description: `We were unable to ${type} your player. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Player successfully ${type}d`,
            description: `Your player ${type}ment has been processed.`,
            status: 'success',
          });
          queryClient.invalidateQueries({ queryKey: ['updateEvents'] });
          queryClient.invalidateQueries({ queryKey: ['myPlayerInfo'] });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  }, [retirePlayer, playerUpdateID, addToast, type, queryClient]);

  return { submitRetire, isSubmitting };
};
