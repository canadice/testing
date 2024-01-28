import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import classnames from 'classnames';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useSeason } from 'hooks/useSeason';
import {
  COACHING_MAX,
  TRAINING_COSTS,
  COACHING_COSTS,
  MAXIMUM_BANK_OVERDRAFT,
} from 'lib/constants';
import { startCase } from 'lodash';
import { useState, useMemo, useCallback, useContext, useEffect } from 'react';
import { formatCurrency } from 'utils/formatCurrency';
import { mutate } from 'utils/query';

import { ActivityTypes } from '../constants';

export const ActivityButtons = () => {
  const [formType, setFormType] = useState<ActivityTypes | undefined>(
    undefined,
  );

  const [coachingAmount, setCoachingAmount] = useState<number>(0);

  const queryClient = useQueryClient();

  const { addToast } = useContext(ToastContext);

  const { player, loading } = useCurrentPlayer();
  const { season } = useSeason();
  const { session } = useSession();

  const isRookie = useMemo(
    () => (player?.draftSeason ? player.draftSeason > season : undefined),
    [player?.draftSeason, season],
  );

  const isDFA = useMemo(
    () => (player?.draftSeason ? player.draftSeason > season + 1 : undefined),
    [player?.draftSeason, season],
  );

  const maxPurchasable = useMemo(() => {
    if (player && isRookie !== undefined)
      return isRookie
        ? COACHING_MAX.rookie - player.coachingPurchased
        : COACHING_MAX.standard - player.coachingPurchased;
    else return 0;
  }, [isRookie, player]);

  const trainingOptions = useMemo(() => {
    const rookieTrainingOptions = Object.entries(TRAINING_COSTS.rookie)
      .map(([key, cost]) => ({
        tpeAmount: key,
        cost,
      }))
      .reverse();

    const standardTrainingOptions = Object.entries(TRAINING_COSTS.standard)
      .map(([key, cost]) => ({
        tpeAmount: key,
        cost,
      }))
      .reverse();

    if (player && isRookie !== undefined)
      return isRookie ? rookieTrainingOptions : standardTrainingOptions;
    else return [];
  }, [isRookie, player]);

  const [trainingAmount, setTrainingAmount] = useState<string | undefined>(
    undefined,
  );

  const currentCost = useMemo(
    () =>
      coachingAmount *
      (isRookie ? COACHING_COSTS.rookie : COACHING_COSTS.standard),
    [isRookie, coachingAmount],
  );

  useEffect(() => {
    if (trainingOptions.length) {
      setTrainingAmount(trainingOptions[0].tpeAmount);
    }
  }, [trainingOptions]);

  const handleCloseModal = useCallback(() => {
    setFormType(undefined);
    setCoachingAmount(0);
    setTrainingAmount(trainingOptions[0].tpeAmount);
  }, [trainingOptions]);

  const submitChangeRequest = useMutation<
    // TODO: type return type
    { amount: number },
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/activity', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (type?: ActivityTypes) => {
    if (type) {
      setFormType(type);
    }
    setIsSubmitting(true);

    const activityType = type ?? formType;

    submitChangeRequest.mutate(
      {
        pid: player?.pid,
        type: formType ?? type,
        amount:
          activityType === 'Activity Check' || activityType === 'Training Camp'
            ? 2
            : activityType === 'Coaching'
            ? coachingAmount
            : trainingAmount,
      },
      {
        onError: () => {
          setIsSubmitting(false);
          addToast({
            title: `${activityType} failed`,
            description: `There was an issue submitting your ${startCase(
              activityType,
            )}. Please try again.`,
            status: 'error',
          });
        },
        onSettled: () => {
          handleCloseModal();
        },
        onSuccess: ({ amount }) => {
          setIsSubmitting(false);
          addToast({
            title: `${activityType} Complete`,
            description: `Successfully ${
              activityType === 'Training' || activityType === 'Coaching'
                ? 'purchased'
                : 'completed'
            } your ${startCase(activityType)}: ${amount} TPE added.`,
            status: 'success',
          });

          queryClient.invalidateQueries({ queryKey: ['myPlayerInfo'] });
          queryClient.invalidateQueries({ queryKey: ['updateEvents'] });
          queryClient.invalidateQueries({ queryKey: ['tpeEvents'] });
        },
      },
    );
  };

  const hasLowBankFunds = useMemo(
    () =>
      trainingOptions.some(
        (training) =>
          (player?.bankBalance ?? 0) - training.cost < MAXIMUM_BANK_OVERDRAFT,
      ),
    [player?.bankBalance, trainingOptions],
  );

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-3 bg-grey200 p-4">
        <Button
          isLoading={isSubmitting && formType === 'Activity Check'}
          isDisabled={
            loading ||
            !player ||
            player.isSuspended ||
            player.activityCheckComplete
          }
          colorScheme="green"
          bg="green.600"
          onClick={() => handleSubmit('Activity Check')}
        >
          Activity Check
        </Button>
        <Button
          isLoading={isSubmitting && formType === 'Training'}
          isDisabled={
            loading || !player || player.isSuspended || player.trainingPurchased
          }
          colorScheme="blue"
          bg="blue.600"
          onClick={() => setFormType('Training')}
        >
          Weekly Training
        </Button>
        {!isDFA && (
          <>
            {!player?.trainingCampComplete && (
              <Button
                isLoading={isSubmitting && formType === 'Training Camp'}
                isDisabled={
                  loading ||
                  !player ||
                  player.isSuspended ||
                  player.trainingCampComplete
                }
                colorScheme="blue"
                bg="blue.600"
                onClick={() => handleSubmit('Training Camp')}
              >
                Training Camp
              </Button>
            )}
            {maxPurchasable > 0 && (
              <Button
                isLoading={isSubmitting && formType === 'Coaching'}
                isDisabled={
                  loading ||
                  !player ||
                  player.isSuspended ||
                  maxPurchasable === 0
                }
                colorScheme="blue"
                bg="blue.600"
                onClick={() => setFormType('Coaching')}
              >
                Seasonal Coaching
              </Button>
            )}
          </>
        )}
      </div>
      <Modal
        size="md"
        isOpen={Boolean(formType === 'Coaching' || formType === 'Training')}
        onClose={handleCloseModal}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Purchase {startCase(formType)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {formType === 'Coaching' && (
              <>
                <div className="flex justify-between">
                  <span
                    className={classnames(
                      (player?.bankBalance ?? 0) - currentCost <
                        MAXIMUM_BANK_OVERDRAFT
                        ? 'text-red200'
                        : 'default:',
                    )}
                  >
                    Current Cost: {formatCurrency(currentCost)}
                  </span>
                  <span>Max Purchasable: {maxPurchasable}</span>
                </div>
                <Input
                  type="number"
                  value={coachingAmount}
                  min={0}
                  max={maxPurchasable}
                  onChange={(val) =>
                    setCoachingAmount(Number(val.currentTarget.value))
                  }
                ></Input>

                <Slider
                  aria-label="Change coaching amount to be purchased"
                  defaultValue={0}
                  value={coachingAmount}
                  onChange={(val) => setCoachingAmount(val)}
                  max={maxPurchasable}
                  focusThumbOnChange={false}
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <span className="text-xs">
                  You are allowed to overdraft by up to{' '}
                  {formatCurrency(-MAXIMUM_BANK_OVERDRAFT)}.
                </span>
              </>
            )}
            {formType === 'Training' && (
              <>
                {hasLowBankFunds && (
                  <Alert variant="subtle" status="error" className="mb-4">
                    <AlertIcon />
                    <AlertDescription fontSize="sm">
                      Some training options are unavailable based on current
                      bank balance.
                    </AlertDescription>
                  </Alert>
                )}
                <Select
                  onChange={(e) => setTrainingAmount(e.target.value)}
                  name="trainingAmount"
                  value={trainingAmount}
                >
                  {trainingOptions.map((training) => (
                    <option
                      key={`training-amount-${training.tpeAmount}`}
                      value={training.tpeAmount}
                      disabled={
                        (player?.bankBalance ?? 0) - training.cost <
                        MAXIMUM_BANK_OVERDRAFT
                      }
                    >
                      +{training.tpeAmount} - {formatCurrency(training.cost)}
                    </option>
                  ))}
                </Select>
                <span className="text-xs">
                  You are allowed to overdraft by up to{' '}
                  {formatCurrency(-MAXIMUM_BANK_OVERDRAFT)}.
                </span>
              </>
            )}
          </ModalBody>
          <div className="flex items-center p-4">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleSubmit()}
              isLoading={isSubmitting}
              isDisabled={
                (formType === 'Coaching'
                  ? coachingAmount === 0 ||
                    (player?.bankBalance ?? 0) - currentCost <
                      MAXIMUM_BANK_OVERDRAFT ||
                    coachingAmount > maxPurchasable
                  : !trainingAmount) || player?.isSuspended
              }
              type="submit"
              className="w-1/2"
            >
              Submit
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </>
  );
};
