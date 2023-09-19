import {
    Alert,
    AlertIcon,
    Button,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    useDisclosure,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { SubHeading } from '../common/SubHeading';
import { ToastContext } from '../../contexts/ToastContext';
import { useGetAvailableTpe } from '../../hooks/useCalculateAvailableTPE';

// If we ever start using limitations on attributes based on position
// import { STARTING_TPE, LIMITED_ATTRIBUTES } from '../../lib/constants';
import { STARTING_TPE } from '../../lib/constants';
import { isEmpty } from 'lodash';
import React, {
    useEffect,
    useState,
    useMemo,
    useCallback,
    useContext,
} from 'react';
import { Player } from '../../typings';

import { CREATE_ATTRIBUTE_FORM } from './attributeForms/attributeFormFlags';
import { GoalieForm } from './attributeForms/GoalieForm';
import { SkaterForm } from './attributeForms/SkaterForm';
import BasicPlayerSheet from './common/BasicPlayerSheet';
import { RoleSelector } from './common/RoleSelector';
import { GoalieTpeScale, SkaterTpeScale } from './common/TPEScales';
import { PlayerRole } from './constants';
import { PlayerInfoForm } from './PlayerInfoForm';
import { CommonCreatePlayerFormProps } from './shared';

export const CreatePlayerForm = ({
    values,
    touched,
    errors,
    handleBlur,
    handleChange,
    initialValues,
    isSubmitting,
    isValid,
    handleSubmit,
    setFieldValue,
    resetForm,
}: CommonCreatePlayerFormProps) => {
    const [role, setRole] = useState<PlayerRole>();
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { addToast } = useContext(ToastContext);

    const showErrorToast = useCallback(
        (error: string) =>
            addToast({
                title: 'Player not created',
                description: error,
                status: 'error',
            }),
        [addToast],
    );

    const isKeeper = useMemo(
        () => values.position === 'Goalkeeper',
        [values.position],
    );

    const availableTPE = useGetAvailableTpe({
        position: values.position ?? 'Center',
        totalTPE: STARTING_TPE,
        attributes: isKeeper ? values.goalie : values.skater,
    });

    useEffect(() => {
        setFieldValue('availableTPE', availableTPE);
    }, [availableTPE, setFieldValue]);

    useEffect(() => {
        setRole(undefined);
    }, [values.position]);

    // Removed as we do not currently use limited attributes based on position
    // useEffect(() => {
    //     if (
    //         values.position === 'Left Defense' ||
    //         values.position === 'Right Defense'
    //     ) {
    //         if (
    //             values.skater.shootingAccuracy > LIMITED_ATTRIBUTES.shootingAccuracy.max
    //         ) {
    //             setFieldValue(
    //                 'skater.shootingAccuracy',
    //                 LIMITED_ATTRIBUTES.shootingAccuracy.max,
    //             );
    //         }
    //     } else if (values.position !== 'Goalie') {
    //         if (values.skater.shootingRange > LIMITED_ATTRIBUTES.shootingRange.max) {
    //             setFieldValue(
    //                 'skater.shootingRange',
    //                 LIMITED_ATTRIBUTES.shootingRange.max,
    //             );
    //         }
    //         if (values.skater.shotBlocking > LIMITED_ATTRIBUTES.shotBlocking.max) {
    //             setFieldValue(
    //                 'skater.shotBlocking',
    //                 LIMITED_ATTRIBUTES.shotBlocking.max,
    //             );
    //         }
    //     }
    // }, [
    //     setFieldValue,
    //     values.position,
    //     values.skater.shootingAccuracy,
    //     values.skater.shootingRange,
    //     values.skater.shotBlocking,
    // ]);

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

    return (
        <form onSubmit={onSubmit}>
            <div className="flex flex-col">
                <PlayerInfoForm
                    values={values}
                    setFieldValue={setFieldValue}
                    errors={errors}
                    touched={touched}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                />

                <SubHeading>Attributes</SubHeading>

                {isKeeper ? <GoalieTpeScale /> : <SkaterTpeScale />}

                <div className="p-2">
                    <RoleSelector
                        role={role}
                        setRole={setRole}
                        position={values.position}
                    />
                </div>

                <div className="flex flex-col gap-6">
                    {isKeeper ? (
                        <GoalieForm
                            attributeFormFlags={CREATE_ATTRIBUTE_FORM}
                            initialValues={initialValues.goalie}
                            values={values}
                            errors={errors}
                            touched={touched}
                            handleBlur={handleBlur}
                            setFieldValue={setFieldValue}
                        />
                    ) : (
                        <SkaterForm
                            attributeFormFlags={CREATE_ATTRIBUTE_FORM}
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

                <div className="sticky inset-x-0 bottom-0 flex items-center bg-grey900 p-2">
                    <div className="flex w-full flex-col items-center sm:flex-row">
                        <div
                            className={classnames(
                                'flex w-full items-center justify-center pb-2 text-lg sm:pb-0',
                                availableTPE < 0 ? 'text-red200' : 'text-grey100',
                            )}
                        >
                            <span className="whitespace-nowrap">Available TPE: </span>
                            <span className="ml-1 whitespace-nowrap font-mont font-semibold">
                                {availableTPE}
                            </span>
                        </div>
                        <div className="flex w-full flex-row space-x-2">
                            <Button
                                className="w-full"
                                aria-label="Reset applied TPE"
                                colorScheme="gray"
                                onClick={() =>
                                    resetForm({
                                        values: {
                                            ...values,
                                            skater: { ...initialValues.skater },
                                            goalie: { ...initialValues.goalie },
                                        },
                                    })
                                }
                            >
                                Reset TPE
                            </Button>

                            <Button
                                className="w-full"
                                colorScheme="blue"
                                isLoading={isSubmitting}
                                isDisabled={!userHasTouchedForm}
                                type="button"
                                onClick={onOpen}
                            >
                                Submit
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
                    <ModalHeader>Confirm Player Creation</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {!isEmpty(errors) ? (
                            <div className="mb-6 space-y-4">
                                <div className="text-lg">
                                    Errors found in your build! Please resolve these to submit
                                    your build for review.
                                </div>
                                {Object.entries(errors).map(([key, value]) => (
                                    <Alert key={key} status="error">
                                        <>
                                            <AlertIcon />
                                            Error:{' '}
                                            {typeof value === 'string'
                                                ? value
                                                : JSON.stringify(value)}
                                        </>
                                    </Alert>
                                ))}
                            </div>
                        ) : (
                            <BasicPlayerSheet
                                info={values as Partial<Player>}
                                attributes={isKeeper ? values.goalie : values.skater}
                            >
                                <Alert status="success" className="mb-6">
                                    <AlertIcon />
                                    No errors found! Your build is valid
                                </Alert>
                                Are you sure you would like to submit your current player to the
                                SMJHL interns to be approved? Please review your player&apos;s
                                build below.
                            </BasicPlayerSheet>
                        )}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="red" className="mr-2" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            colorScheme="blue"
                            type="submit"
                            isDisabled={!userHasTouchedForm || !isValid}
                            isLoading={isSubmitting}
                            onClick={onSubmit}
                        >
                            Confirm
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </form>
    );
};