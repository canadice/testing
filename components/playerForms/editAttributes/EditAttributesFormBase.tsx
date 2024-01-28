import { ArrowForwardIcon, CloseIcon, RepeatIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertProps,
  Badge,
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { SubHeading } from 'components/common/SubHeading';
import { ToastContext } from 'contexts/ToastContext';
import { useGetAvailableTpe } from 'hooks/useCalculateAvailableTPE';
import { useGetCappedTPE } from 'hooks/useGetCappedTPE';
import {
  GOALIE_ATTRIBUTE_COSTS,
  SKATER_ATTRIBUTE_COSTS,
  REDISTRIBUTION_COSTS,
  MAX_REDISTRIBUTION_TPE,
  EXCESSIVE_REGRESSION_THRESHOLD,
} from 'lib/constants';
import { isEmpty } from 'lodash';
import { startCase } from 'lodash';
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  PropsWithChildren,
  useContext,
} from 'react';
import { Player } from 'typings';
import { formatCurrency } from 'utils/formatCurrency';

import { AttributeFormFlags } from '../attributeForms/attributeFormFlags';
import { GoalieForm } from '../attributeForms/GoalieForm';
import { SkaterForm } from '../attributeForms/SkaterForm';
import { RoleSelector } from '../common/RoleSelector';
import { GoalieTpeScale, SkaterTpeScale } from '../common/TPEScales';
import { PlayerRole } from '../constants';
import { CommonEditAttributesFormProps, mapAttributeChanges } from '../shared';

const FormAlert = ({
  status,
  children,
}: PropsWithChildren & Pick<AlertProps, 'status'>): JSX.Element => (
  <Alert className="mb-3" variant="subtle" status={status}>
    <AlertIcon />
    <AlertDescription fontSize="md">{children}</AlertDescription>
  </Alert>
);

export const EditAttributesFormBase = ({
  values,
  touched,
  errors,
  handleBlur,
  initialValues,
  isSubmitting,
  isValid,
  handleSubmit,
  setFieldValue,
  attributeFormFlags,
  onCancel,
  player,
  season,
  resetForm,
}: CommonEditAttributesFormProps & {
  attributeFormFlags: AttributeFormFlags;
  onCancel: () => void;
  player: Player;
  season: number;
}) => {
  const [role, setRole] = useState<PlayerRole>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { addToast } = useContext(ToastContext);

  const showErrorToast = useCallback(
    (error: string) =>
      addToast({
        title: `${
          attributeFormFlags.type === 'Redistribute'
            ? 'Redistribution'
            : attributeFormFlags.type
        } not processed.`,
        description: error,
        status: 'error',
      }),
    [attributeFormFlags.type, addToast],
  );

  const isGoalie = useMemo(
    () => values.position === 'Goalie',
    [values.position],
  );

  const { totalTPE, isCappedTPE } = useGetCappedTPE(player, season);

  const availableTPE = useGetAvailableTpe({
    position: values.position,
    totalTPE,
    attributes: isGoalie ? values.goalie : values.skater,
  });

  useEffect(() => {
    setFieldValue('availableTPE', availableTPE);
  }, [availableTPE, setFieldValue]);

  useEffect(() => {
    setRole(undefined);
  }, [values.position]);

  const onSubmit = useCallback(() => {
    onClose();
    if (Boolean(errors.availableTPE)) {
      showErrorToast(errors.availableTPE ?? '');
    } else if (!isEmpty(errors)) {
      showErrorToast('Please verify all required fields have been filled.');
    }
    handleSubmit();
  }, [errors, onClose, showErrorToast, handleSubmit]);

  const userHasTouchedForm = useMemo(
    () => Object.keys(touched).length > 0,
    [touched],
  );

  const confirmationText = useMemo(() => {
    switch (attributeFormFlags.type) {
      case 'Update':
      case 'Regression':
        return `Are you sure you would like to submit this update? All changes are final.`;
      case 'Redistribute':
        return 'Are you sure you would like to finalize this redistribution? All redistributions are final.';
      case 'Create':
        return 'Clicking confirm will overwrite any existing saved build and generate a new shareable link.';
    }
  }, [attributeFormFlags]);

  const attributeChanges = useMemo(
    () => mapAttributeChanges(initialValues, values, player.position),
    [initialValues, player.position, values],
  );

  const redistributionInfo = useMemo(() => {
    const values = {
      totalRedistributedTPE: 0,
      isRookie: false,
      totalCost: 0,
    };

    if (attributeFormFlags.type !== 'Redistribute') {
      return values;
    }

    values.isRookie = (player.draftSeason ?? 0) - 1 === season;

    const attributeCostMap = isGoalie
      ? GOALIE_ATTRIBUTE_COSTS
      : SKATER_ATTRIBUTE_COSTS;

    const totalRedistributedTPE = attributeChanges
      .map(
        (change) =>
          attributeCostMap[change.oldValue as keyof typeof attributeCostMap]
            ?.totalCost -
          attributeCostMap[change.newValue as keyof typeof attributeCostMap]
            ?.totalCost,
      )
      .reduce((a, b) => {
        return a + b;
      }, 0);

    values.totalRedistributedTPE = totalRedistributedTPE;

    values.totalCost =
      values.totalRedistributedTPE *
      (values.isRookie
        ? REDISTRIBUTION_COSTS.rookie
        : REDISTRIBUTION_COSTS.standard);

    return values;
  }, [
    attributeChanges,
    attributeFormFlags.type,
    isGoalie,
    player.draftSeason,
    season,
  ]);

  const redistributionValidation = useMemo(() => {
    const validations = {
      insufficientFunds: false,
      usedSeasonalRedistribution: false,
      totalRedistributedTPE: 0,
    };

    if (attributeFormFlags.type !== 'Redistribute') {
      return validations;
    } else if (!player.bankBalance) {
      validations.insufficientFunds = true;
      return validations;
    } else if (player.usedRedistribution === undefined) {
      validations.usedSeasonalRedistribution = true;
      return validations;
    } else {
      const attributeCostMap = isGoalie
        ? GOALIE_ATTRIBUTE_COSTS
        : SKATER_ATTRIBUTE_COSTS;

      const totalRedistributedTPE = attributeChanges
        .map(
          (change) =>
            attributeCostMap[change.oldValue as keyof typeof attributeCostMap]
              ?.totalCost -
            attributeCostMap[change.newValue as keyof typeof attributeCostMap]
              ?.totalCost,
        )
        .reduce((a, b) => {
          return a + b;
        }, 0);

      const validations = {
        insufficientFunds:
          totalRedistributedTPE *
            (redistributionInfo?.isRookie
              ? REDISTRIBUTION_COSTS.rookie
              : REDISTRIBUTION_COSTS.standard) >
          player.bankBalance,
        usedSeasonalRedistribution:
          totalRedistributedTPE + (player.usedRedistribution ?? 0) >
          MAX_REDISTRIBUTION_TPE,
        totalRedistributedTPE: redistributionInfo?.totalRedistributedTPE,
      };

      return validations;
    }
  }, [
    attributeChanges,
    attributeFormFlags.type,
    isGoalie,
    player.bankBalance,
    player.usedRedistribution,
    redistributionInfo?.isRookie,
    redistributionInfo?.totalRedistributedTPE,
  ]);

  const regressionValidation = useMemo(() => {
    const validations = { excessRegression: false };

    if (attributeFormFlags.type !== 'Regression') {
      return validations;
    }

    validations.excessRegression =
      availableTPE > EXCESSIVE_REGRESSION_THRESHOLD;

    return validations;
  }, [attributeFormFlags.type, availableTPE]);

  const hasFormError = useMemo(
    () =>
      !isEmpty(errors) ||
      redistributionValidation.insufficientFunds ||
      redistributionValidation.usedSeasonalRedistribution ||
      regressionValidation.excessRegression,
    [
      errors,
      redistributionValidation.insufficientFunds,
      redistributionValidation.usedSeasonalRedistribution,
      regressionValidation.excessRegression,
    ],
  );

  return (
    <form onSubmit={onSubmit}>
      <div className="flex items-center justify-center">
        <div className="flex w-full flex-col">
          <SubHeading>Attributes</SubHeading>

          {isGoalie ? <GoalieTpeScale /> : <SkaterTpeScale />}

          <div className="p-2">
            <RoleSelector
              role={role}
              setRole={setRole}
              position={values.position}
            />
          </div>

          <div className="flex flex-col gap-6">
            {isGoalie ? (
              <GoalieForm
                attributeFormFlags={attributeFormFlags}
                initialValues={initialValues.goalie}
                values={values}
                errors={errors}
                touched={touched}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />
            ) : (
              <SkaterForm
                attributeFormFlags={attributeFormFlags}
                initialValues={initialValues.skater}
                values={values}
                errors={errors}
                touched={touched}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
                role={role}
              />
            )}
          </div>

          <div className="sticky inset-x-0 bottom-0  bg-grey900 p-2">
            {attributeFormFlags.type === 'Redistribute' && (
              <div className="flex items-center pb-2">
                <div
                  className={classnames(
                    'flex w-full flex-col items-center justify-center whitespace-nowrap p-2 text-lg sm:flex-row sm:space-x-2',
                    (player?.usedRedistribution ?? 0) +
                      redistributionInfo.totalRedistributedTPE >
                      MAX_REDISTRIBUTION_TPE
                      ? 'text-red200'
                      : 'text-grey100',
                  )}
                >
                  <span>Redistributed TPE:</span>
                  <span className="font-mont font-semibold">
                    {redistributionInfo.totalRedistributedTPE}
                  </span>
                </div>
                <div
                  className={classnames(
                    'flex w-full flex-col items-center justify-center whitespace-nowrap p-2 text-lg sm:flex-row sm:space-x-2',
                    redistributionInfo.totalCost > (player?.bankBalance ?? 0)
                      ? 'text-red200'
                      : 'text-grey100',
                  )}
                >
                  <span>Redistribute Cost:</span>
                  <span className="font-mont font-semibold">
                    {formatCurrency(redistributionInfo.totalCost)}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center sm:flex-row">
              <div
                className={classnames(
                  'flex w-full items-center justify-center pb-2 text-lg sm:pb-0',
                  availableTPE < 0 ? 'text-red200' : 'text-grey100',
                )}
              >
                <span className="whitespace-nowrap">Available TPE: </span>
                <span className="ml-1 whitespace-nowrap font-mont font-semibold">
                  {availableTPE}
                  {isCappedTPE ||
                    (totalTPE < player.totalTPE && (
                      <Tooltip
                        hasArrow
                        label={`Your TPE is capped at ${totalTPE}`}
                        bg="gray.300"
                        color="black"
                      >
                        <Badge className="ml-2" colorScheme="red">
                          CAPPED
                        </Badge>
                      </Tooltip>
                    ))}
                </span>
              </div>
              <div className="flex w-full flex-row space-x-2">
                <IconButton
                  icon={<CloseIcon />}
                  aria-label={
                    attributeFormFlags.type !== 'Create'
                      ? 'Cancel'
                      : 'Clear Form'
                  }
                  colorScheme="red"
                  type="button"
                  onClick={onCancel}
                />
                <IconButton
                  icon={<RepeatIcon />}
                  aria-label={
                    attributeFormFlags.type !== 'Create' ? 'Reset' : 'Reset TPE'
                  }
                  colorScheme="gray"
                  type="button"
                  onClick={() => resetForm()}
                />
                <Button
                  className="w-full"
                  aria-label="Save changes"
                  colorScheme="blue"
                  isLoading={isSubmitting}
                  isDisabled={!attributeChanges.length}
                  type="button"
                  onClick={onOpen}
                >
                  {attributeFormFlags.type === 'Create' ? 'Save' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Modal
          size="3xl"
          isOpen={isOpen}
          onClose={onClose}
          isCentered
          scrollBehavior="inside"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {hasFormError
                ? 'Form Errors'
                : `Confirm Player ${attributeFormFlags.type}`}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {hasFormError ? (
                <div className="mb-6 space-y-4">
                  <FormAlert status="info">
                    {`Errors found in your ${
                      attributeFormFlags.type === 'Redistribute'
                        ? 'redistribution'
                        : attributeFormFlags.type.toLocaleLowerCase()
                    }! Please resolve these to save your changes.`}
                  </FormAlert>

                  {!isEmpty(errors) && (
                    <>
                      {Object.entries(errors).map(([key, value]) => (
                        <FormAlert key={key} status="error">
                          {typeof value === 'string'
                            ? value
                            : JSON.stringify(value)}
                        </FormAlert>
                      ))}
                    </>
                  )}
                  {redistributionValidation.insufficientFunds && (
                    <FormAlert status="error">
                      You have insufficient funds available for this
                      redistribution.
                    </FormAlert>
                  )}
                  {redistributionValidation.usedSeasonalRedistribution && (
                    <FormAlert status="error">
                      {Number(player.usedRedistribution ?? 0) >
                      MAX_REDISTRIBUTION_TPE
                        ? `You have used the maximum amount of redistributed TPE for this season: ${player.usedRedistribution}`
                        : `You have redistributed ${player.usedRedistribution} TPE this season, and combined with the current changes, would exceed the limit of ${MAX_REDISTRIBUTION_TPE} TPE per season.`}
                    </FormAlert>
                  )}
                  {regressionValidation.excessRegression && (
                    <FormAlert status="error">
                      You have an excessive regression. Please adjust the
                      attributes you&apos;ve so that the amount of refunded TPE
                      is {EXCESSIVE_REGRESSION_THRESHOLD} or less.
                    </FormAlert>
                  )}
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-grey200">
                  <FormAlert status="info">{confirmationText}</FormAlert>
                  <div className="py-3 text-center font-mont text-xs font-semibold uppercase tracking-wider">
                    Attribute Changes
                  </div>
                  {attributeChanges.map((change) => (
                    <div
                      key={change.attribute}
                      className="flex items-center justify-between py-4 px-6 font-mont leading-5"
                    >
                      <div>{startCase(change.attribute)}</div>
                      <div>
                        {change.oldValue}
                        <ArrowForwardIcon
                          color={
                            change.oldValue < change.newValue
                              ? 'green.400'
                              : 'red.400'
                          }
                          className="mx-5"
                        />
                        {change.newValue}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" className="mr-2" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                type="submit"
                isDisabled={
                  !userHasTouchedForm ||
                  !isValid ||
                  redistributionValidation.insufficientFunds ||
                  redistributionValidation.usedSeasonalRedistribution ||
                  regressionValidation.excessRegression
                }
                isLoading={isSubmitting}
                onClick={onSubmit}
              >
                Confirm
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </form>
  );
};
