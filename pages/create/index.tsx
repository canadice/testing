import { useMutation } from '@tanstack/react-query';
import { PageWrapper } from 'components/common/PageWrapper';
import { CreateGuideAlert } from 'components/create/CreateGuideAlert';
import { DeniedAlert } from 'components/create/DeniedAlert';
import { UnretireAlert } from 'components/create/UnretireAlert';
import { CreatePlayerForm } from 'components/playerForms/createPlayer/CreatePlayerForm';
import {
  CreatePlayerFormValidation,
  createPlayerValidationSchema,
  defaultPlayer,
  mapPlayerToFormValues,
} from 'components/playerForms/shared';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useFormik } from 'formik';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useRouter } from 'next/router';
import { useContext, useEffect, useMemo } from 'react';
import { mutate } from 'utils/query';

export default () => {
  const router = useRouter();
  const { session, loggedIn } = useSession();
  const { player, loading, status } = useCurrentPlayer();

  useEffect(() => {
    if (loggedIn && !loading) {
      if (status === 'active' || status === 'pending') {
        router.replace('/player');
      }
    }
  }, [loading, loggedIn, router, status]);

  const { addToast } = useContext(ToastContext);

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/');
    }
  }, [loggedIn, router]);

  const createPlayer = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/create', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const adjustPlayer = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/adjust', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const initialFormValues: CreatePlayerFormValidation = useMemo(() => {
    if (player && player.status === 'denied') {
      return mapPlayerToFormValues(player);
    } else {
      return defaultPlayer;
    }
  }, [player]);

  const {
    errors,
    touched,
    values,
    isSubmitting,
    isValid,
    initialValues,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
    resetForm,
  } = useFormik<CreatePlayerFormValidation>({
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: initialFormValues,
    onSubmit: (
      { skater, goalie, availableTPE, ...info },
      { setSubmitting },
    ) => {
      setSubmitting(true);

      const birthplace =
        info.birthCountry === 'Other'
          ? `${info.birthCity}, ${info.customBirthCountry}`
          : `${info.birthCity}, ${info.birthCountry}`;

      const playerMutation = status === 'denied' ? adjustPlayer : createPlayer;

      playerMutation.mutate(
        {
          pid: player?.pid,
          skater,
          goalie,
          availableTPE,
          info: {
            birthplace,
            // Filter out internal-only keys
            ...Object.fromEntries(
              Object.entries(info).filter(
                ([key]) =>
                  ![
                    'heightFeet',
                    'heightInches',
                    'birthCountry',
                    'customBirthCountry',
                    'birthCity',
                  ].includes(key),
              ),
            ),
          },
        },
        {
          onError: () => {
            addToast({
              title: 'Player not created',
              description:
                'We were unable to create your player. Please try again.',
              status: 'error',
            });
            setSubmitting(false);
          },
          onSuccess: () => {
            router.push('/player');
          },
        },
      );
    },
    validationSchema: createPlayerValidationSchema,
  });

  return (
    <PageWrapper
      title="Create a Player"
      className="space-y-4"
      loading={loading}
    >
      {(!player || status === 'retired' || status === 'denied') && (
        <>
          <CreateGuideAlert />
          <DeniedAlert />
          <UnretireAlert isDisabled={isSubmitting} />
          <div className="mt-4">
            <CreatePlayerForm
              isSubmitting={isSubmitting}
              isValid={isValid}
              initialValues={initialValues}
              errors={errors}
              touched={touched}
              values={values}
              handleBlur={handleBlur}
              setFieldValue={setFieldValue}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              resetForm={resetForm}
            />
          </div>
        </>
      )}
    </PageWrapper>
  );
};
