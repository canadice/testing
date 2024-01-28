import { EditIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useSeason } from 'hooks/useSeason';
import { useUpdateEvents } from 'hooks/useUpdateEvents';
import { CHANGE_COSTS } from 'lib/constants';
import { startCase } from 'lodash';
import React, { useContext, useMemo, useState } from 'react';
import { assertUnreachable } from 'utils/assertUnreachable';
import { formatCurrency } from 'utils/formatCurrency';
import { mutate } from 'utils/query';

import { ChangeTypes } from '../constants';

import { ChangeForm, ChangeFormValues } from './ChangeForm';

type Props = {
  type: ChangeTypes;
};

export const ChangeIcon: React.FC<Props> = ({ type }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { addToast } = useContext(ToastContext);
  const { player } = useCurrentPlayer();
  const { season } = useSeason();
  const { updateFlags } = useUpdateEvents(player?.pid);
  const { session } = useSession();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const oldValue = useMemo(() => {
    switch (type) {
      case 'Name':
        return player?.name ?? '';
      case 'Position':
        return player?.position ?? '';
      case 'Render':
        return player?.render ?? '';
      case 'JerseyNumber':
        return player?.jerseyNumber ?? 0;
      default:
        assertUnreachable(type as never);
        return '';
    }
  }, [
    player?.jerseyNumber,
    player?.name,
    player?.position,
    player?.render,
    type,
  ]);

  const submitChangeRequest = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/request', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleOpenModal = () => {
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
  };

  const handleSubmit = (formValues: ChangeFormValues) => {
    setIsSubmitting(true);

    submitChangeRequest.mutate(
      {
        uid: player?.uid,
        pid: player?.pid,
        type: formValues.type,
        oldValue,
        newValue: formValues.newValue,
      },
      {
        onError: () => {
          setIsSubmitting(false);
          addToast({
            title: 'Change not submitted',
            description: `There was an issue submitting your ${startCase(
              type,
            )} change. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          setIsSubmitting(false);
          addToast({
            title: 'Change submitted',
            description: `Successfully submitted your ${startCase(
              type,
            )} change. If your change is pending, it will not reflect in the portal until approved.`,
            status: 'success',
          });

          queryClient.invalidateQueries({ queryKey: ['myPlayerInfo'] });
          queryClient.invalidateQueries({ queryKey: ['updateEvents'] });
          handleCloseModal();
        },
      },
    );
  };

  const changeCost = useMemo(() => {
    switch (type) {
      case 'Name':
        return CHANGE_COSTS.name;
      case 'Position':
        return player?.draftSeason === season && player?.position === 'Goalie'
          ? false
          : CHANGE_COSTS.position;
      case 'Render':
      case 'JerseyNumber':
        return false;
      default:
        return Infinity;
    }
  }, [player?.position, player?.draftSeason, season, type]);

  const disabledReason = useMemo(() => {
    const reasons = {
      Name: '',
      Position: '',
      Render: '',
      JerseyNumber: '',
    };

    switch (type) {
      case 'Name':
        if (updateFlags.namePending) {
          reasons.Name =
            'You have a pending name change that requires approval.';
        }
      case 'Position':
        if (updateFlags.positionPending) {
          reasons.Position =
            'You have a pending position change that requires approval.';
        } else if (player?.positionChanged) {
          reasons.Position = 'You have already used your position change.';
        } else if (
          player?.position === 'Goalie' &&
          player?.draftSeason !== season
        ) {
          reasons.Position = 'You cannot not switch from the Goalie positon.';
        }
      case 'Render':
        if (updateFlags.renderPending)
          reasons.Render =
            'You have a pending render change that requires approval.';
    }

    if (reasons[type] === '') {
      if (
        typeof changeCost === 'number' &&
        changeCost > (player?.bankBalance ?? 0)
      ) {
        reasons[
          type
        ] = `You cannot submit a change for ${type} because your bank balance of ${formatCurrency(
          player?.bankBalance ?? 0,
        )} does not meet or exceed the change cost of ${formatCurrency(
          changeCost,
        )}.`;
      }
    }

    return reasons;
  }, [
    type,
    updateFlags.namePending,
    updateFlags.positionPending,
    updateFlags.renderPending,
    player?.positionChanged,
    player?.position,
    player?.draftSeason,
    player?.bankBalance,
    season,
    changeCost,
  ]);

  return (
    <>
      <IconButton
        size="sm"
        variant="unstyled"
        className="self-center hover:text-blue700"
        icon={
          <EditIcon
            className={`${type === 'Render' ? 'mb-1' : 'mb-2 lg:mb-1'}`}
          />
        }
        onClick={handleOpenModal}
        aria-label={`Edit ${type}`}
      />

      <Modal
        size={disabledReason || changeCost ? 'md' : 'sm'}
        isOpen={isOpen}
        onClose={handleCloseModal}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit {startCase(type)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {disabledReason[type] !== '' ? (
              <Alert variant="subtle" status="error" className="mb-4">
                <AlertIcon />
                <AlertDescription fontSize="sm">
                  {disabledReason[type]}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {typeof changeCost === 'number' && changeCost > 0 && (
                  <Alert variant="subtle" status="info" className="mb-4">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Submitting this change for {startCase(type)} will
                      immediately deduct {formatCurrency(changeCost)} from your
                      bank account while your request awaits approval.
                    </AlertDescription>
                  </Alert>
                )}
                <ChangeForm
                  onCancel={handleCloseModal}
                  onSubmit={handleSubmit}
                  isSubmitting={isSubmitting}
                  type={type}
                  position={player?.position}
                />
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
