import { useFormik } from 'formik';
import { useGetAvailableTpe } from 'hooks/useCalculateAvailableTPE';
import { useMemo } from 'react';
import { Player, GoalieAttributes, SkaterAttributes } from 'typings';

import {
  AttributeFormTypes,
  UPDATE_ATTRIBUTE_FORM,
  REGRESSION_ATTRIBUTE_FORM,
  REDISTRIBUTE_ATTRIBUTE_FORM,
  CREATE_ATTRIBUTE_FORM,
} from '../attributeForms/attributeFormFlags';
import {
  editAttributesFormSchema,
  defaultPlayer,
  EditAttributesFormValidation,
  mapAttributeChanges,
} from '../shared';

import { EditAttributesFormBase } from './EditAttributesFormBase';

export type AttributeChange = {
  attribute: string;
  oldValue: number;
  newValue: number;
};

export const EditAttributesForm = ({
  attributeFormType,
  player,
  season,
  onSubmitCallback,
  isSubmitting,
  onCancel,
}: {
  attributeFormType: AttributeFormTypes;
  player: Player;
  season: number;
  onSubmitCallback: (
    changes: AttributeChange[],
    player: Partial<Player>,
    goalie?: Partial<GoalieAttributes>,
    skater?: Partial<SkaterAttributes>,
  ) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}) => {
  const attributeFormSchema = useMemo(
    () => editAttributesFormSchema({ type: attributeFormType }),
    [attributeFormType],
  );

  const attributeFormFlags = useMemo(() => {
    switch (attributeFormType) {
      case 'Update':
        return UPDATE_ATTRIBUTE_FORM({
          totalTPE: player?.totalTPE ?? 0,
        });
      case 'Regression':
        return REGRESSION_ATTRIBUTE_FORM({
          totalTPE: player?.totalTPE ?? 0,
        });
      case 'Redistribute':
        return REDISTRIBUTE_ATTRIBUTE_FORM({
          totalTPE: player?.totalTPE ?? 0,
        });
      case 'Create':
        return CREATE_ATTRIBUTE_FORM;
      default:
        return UPDATE_ATTRIBUTE_FORM({
          totalTPE: player?.totalTPE ?? 0,
        });
    }
  }, [attributeFormType, player?.totalTPE]);

  const availableTPE = useGetAvailableTpe({
    position: player.position,
    totalTPE: player.totalTPE,
    attributes: player.attributes,
  });

  const initialFormValues = useMemo(() => {
    if (player)
      return {
        position: player.position ?? 'Center',
        skater: player.attributes as SkaterAttributes,
        goalie: player.attributes as GoalieAttributes,
        availableTPE,
      };
    else return defaultPlayer;
  }, [player, availableTPE]);

  const {
    errors,
    touched,
    values,
    isSubmitting: isFormSubmitting,
    isValid,
    initialValues,
    handleBlur,
    handleChange,
    setFieldValue,
    setSubmitting,
    handleSubmit,
    resetForm,
  } = useFormik<EditAttributesFormValidation>({
    validateOnBlur: true,
    validateOnChange: false,
    enableReinitialize: true,
    initialValues: initialFormValues,
    onSubmit: async ({ skater, goalie }) => {
      const isGoalie = player.position === 'Goalie';

      const attributeChanges = mapAttributeChanges(
        initialFormValues,
        { skater, goalie } as EditAttributesFormValidation,
        player.position,
      );

      await onSubmitCallback(
        attributeChanges,
        {
          position: player.position,
          pid: player.pid,
          uid: player.uid,
        },
        isGoalie ? goalie : undefined,
        isGoalie ? undefined : skater,
      )
        .then(() => setSubmitting(false))
        .catch(() => {});
    },
    validationSchema: attributeFormSchema,
  });

  return (
    <>
      {player && (
        <EditAttributesFormBase
          isSubmitting={isSubmitting || isFormSubmitting}
          isValid={isValid}
          initialValues={initialValues}
          errors={errors}
          touched={touched}
          values={values}
          handleBlur={handleBlur}
          setFieldValue={setFieldValue}
          handleSubmit={handleSubmit}
          handleChange={handleChange}
          attributeFormFlags={attributeFormFlags}
          onCancel={onCancel}
          resetForm={resetForm}
          player={player}
          season={season}
        />
      )}
    </>
  );
};
