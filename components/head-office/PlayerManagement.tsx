import { Button, ListItem, UnorderedList } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DismissableAlert } from 'components/common/DismissableAlert';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { PlayerInfoForm } from 'components/playerForms/PlayerInfoForm';
import {
  CreatePlayerFormValidation,
  mapPlayerToFormValues,
  defaultPlayer,
  createPlayerValidationSchema,
} from 'components/playerForms/shared';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useFormik } from 'formik';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Player } from 'typings';
import { mutate, query } from 'utils/query';

export const PlayerManagement = () => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>();

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['playerManagement'],
    queryFn: () => query(`api/v1/player?status=active`, undefined),
  });

  const submitChanges = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/ho-adjust', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const initialFormValues: CreatePlayerFormValidation = useMemo(() => {
    if (actionedPlayer) {
      return { ...mapPlayerToFormValues(actionedPlayer), availableTPE: 0 };
    } else {
      return defaultPlayer;
    }
  }, [actionedPlayer]);

  const {
    errors,
    touched,
    values,
    isSubmitting,
    isValid,
    handleBlur,
    handleChange,
    setFieldValue,
    handleSubmit,
  } = useFormik<CreatePlayerFormValidation>({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true,
    enableReinitialize: true,
    initialValues: initialFormValues,
    onSubmit: ({ ...info }, { setSubmitting }) => {
      setSubmitting(true);

      const birthplace =
        info.birthCountry === 'Other'
          ? `${info.birthCity}, ${info.customBirthCountry}`
          : `${info.birthCity}, ${info.birthCountry}`;

      submitChanges.mutate(
        {
          pid: actionedPlayer?.pid,
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
              title: `Error`,
              description: `Could not save changes for ${actionedPlayer?.name}. Please try again.`,
              status: 'error',
            });
          },
          onSuccess: () => {
            addToast({
              title: `Complete`,
              description: `${actionedPlayer?.name} successfully updated.`,
              status: 'success',
            });
            setActionedPlayer(undefined);
            queryClient.invalidateQueries({ queryKey: ['playerManagement'] });
          },
        },
      );
    },
    validationSchema: createPlayerValidationSchema,
  });

  const [hasInvalidValue, setHasInvalidValue] = useState(false);

  useEffect(() => {
    if (initialFormValues.name) {
      if (
        Number(initialFormValues.heightFeet) > 6 ||
        Number(initialFormValues.heightFeet) < 5 ||
        Number(initialFormValues.weight) > 300 ||
        Number(initialFormValues.weight) < 150 ||
        !initialFormValues.birthCity
      ) {
        setHasInvalidValue(true);
      } else {
        setHasInvalidValue(false);
      }
    }
  }, [
    initialFormValues.birthCity,
    initialFormValues.heightFeet,
    initialFormValues.name,
    initialFormValues.weight,
  ]);

  return (
    <>
      {!actionedPlayer ? (
        <PlayerTable
          data={data ?? []}
          linkTarget="_blank"
          isLoading={isLoading}
          actionConfig={{ action: 'Change', callback: setActionedPlayer }}
        />
      ) : (
        <>
          <form onSubmit={handleSubmit}>
            <PlayerInfoForm
              values={values}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
              handleBlur={handleBlur}
              handleChange={handleChange}
            />
            <DismissableAlert
              variant="subtle"
              status="error"
              className="mb-4 font-mont"
              title="Invalid Values"
              isOpen={hasInvalidValue}
              onClose={() => setHasInvalidValue(false)}
            >
              <p className="mb-4">
                There are invalid values tied to this player. These will need to
                be resolved before you can submit changes.
              </p>
              <p>
                Please validate the following:
                <UnorderedList>
                  <ListItem>
                    Height is within a range of 5ft 0in through 6ft 11in
                  </ListItem>
                  <ListItem>Weight is within a range of 150 to 300</ListItem>
                  <ListItem>Birth City field is filled in</ListItem>
                </UnorderedList>
              </p>
            </DismissableAlert>
            <div className="grid w-full grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-3">
              <Button
                aria-label="Cancel Player Changes"
                colorScheme="red"
                onClick={() => setActionedPlayer(undefined)}
              >
                Cancel
              </Button>

              <Button
                aria-label="Submit Player Changes"
                colorScheme="blue"
                isLoading={isSubmitting}
                isDisabled={!isValid}
                type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        </>
      )}
    </>
  );
};
