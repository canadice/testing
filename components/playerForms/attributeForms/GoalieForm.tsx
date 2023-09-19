import { GoalieAttributes } from 'typings';

import { PlayerAttributeInput } from '../common/PlayerAttributeInput';
import { AttributeSectionWrapper } from '../common/SectionWrapper';
import {
  CommonCreatePlayerFormProps,
  CommonEditAttributesFormProps,
} from '../shared';

import { AttributeFormFlags } from './attributeFormFlags';

export const GoalieForm = ({
  values,
  // errors,
  // touched,
  handleBlur,
  setFieldValue,
  initialValues,
  attributeFormFlags,
}: Omit<
  CommonCreatePlayerFormProps | CommonEditAttributesFormProps,
  | 'handleChange'
  | 'handleSubmit'
  | 'isSubmitting'
  | 'isValid'
  | 'initialValues'
  | 'resetForm'
> & {
  attributeFormFlags: AttributeFormFlags;
  initialValues: Partial<GoalieAttributes>;
}) => {
  return (
    <>
      <AttributeSectionWrapper heading="Goalie Ratings">
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="blocker"
          value={values.goalie.blocker}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.blocker}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="glove"
          value={values.goalie.glove}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.glove}
        />

        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="passing"
          value={values.goalie.passing}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.passing}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="pokeCheck"
          value={values.goalie.pokeCheck}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.pokeCheck}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="positioning"
          value={values.goalie.positioning}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.positioning}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="rebound"
          value={values.goalie.rebound}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.rebound}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="recovery"
          value={values.goalie.recovery}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.recovery}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="puckhandling"
          value={values.goalie.puckhandling}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.puckhandling}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="lowShots"
          value={values.goalie.lowShots}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.lowShots}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="reflexes"
          value={values.goalie.reflexes}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.reflexes}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="skating"
          value={values.goalie.skating}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.skating}
        />
      </AttributeSectionWrapper>
      <AttributeSectionWrapper heading="Mental Ratings">
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="mentalToughness"
          value={values.goalie.mentalToughness}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.mentalToughness}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position="Goalie"
          attribute="goaltenderStamina"
          value={values.goalie.goaltenderStamina}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.goaltenderStamina}
        />
        <PlayerAttributeInput
          isReadOnly
          position="Goalie"
          attribute="aggression"
          value={8}
        />
        <PlayerAttributeInput
          isReadOnly
          position="Goalie"
          attribute="determination"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position="Goalie"
          attribute="teamPlayer"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position="Goalie"
          attribute="leadership"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position="Goalie"
          attribute="professionalism"
          value={15}
        />
      </AttributeSectionWrapper>
    </>
  );
};
