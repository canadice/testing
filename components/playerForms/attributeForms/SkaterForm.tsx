import { SkaterAttributes } from 'typings';

import { PlayerAttributeInput } from '../common/PlayerAttributeInput';
import { AttributeSectionWrapper } from '../common/SectionWrapper';
import { PlayerRole } from '../constants';
import {
  CommonCreatePlayerFormProps,
  CommonEditAttributesFormProps,
} from '../shared';

import { AttributeFormFlags } from './attributeFormFlags';

export const SkaterForm = ({
  role,
  values,
  initialValues,
  // errors,
  // touched,
  handleBlur,
  setFieldValue,
  attributeFormFlags,
}: {
  role?: PlayerRole;
} & Omit<
  CommonCreatePlayerFormProps | CommonEditAttributesFormProps,
  | 'handleChange'
  | 'handleSubmit'
  | 'isSubmitting'
  | 'isValid'
  | 'initialValues'
  | 'resetForm'
> & {
    attributeFormFlags: AttributeFormFlags;
    initialValues: Partial<SkaterAttributes>;
  }) => {
  return (
    <>
      <AttributeSectionWrapper heading="Offensive Ratings">
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="screening"
          value={values.skater.screening}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.screening}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="gettingOpen"
          value={values.skater.gettingOpen}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.gettingOpen}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="passing"
          value={values.skater.passing}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.passing}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="puckhandling"
          value={values.skater.puckhandling}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.puckhandling}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="shootingAccuracy"
          value={values.skater.shootingAccuracy}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.shootingAccuracy}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="shootingRange"
          value={values.skater.shootingRange}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.shootingRange}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="offensiveRead"
          value={values.skater.offensiveRead}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.offensiveRead}
        />
      </AttributeSectionWrapper>
      <AttributeSectionWrapper heading="Defensive Ratings">
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="checking"
          value={values.skater.checking}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.checking}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="hitting"
          value={values.skater.hitting}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.hitting}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="positioning"
          value={values.skater.positioning}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.positioning}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="stickchecking"
          value={values.skater.stickchecking}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.stickchecking}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="shotBlocking"
          value={values.skater.shotBlocking}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.shotBlocking}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="faceoffs"
          value={values.skater.faceoffs}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.faceoffs}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="defensiveRead"
          value={values.skater.defensiveRead}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.defensiveRead}
        />
      </AttributeSectionWrapper>
      <AttributeSectionWrapper heading="Physical Ratings">
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="acceleration"
          value={values.skater.acceleration}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.acceleration}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="agility"
          value={values.skater.agility}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.agility}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="balance"
          value={values.skater.balance}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.balance}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="speed"
          value={values.skater.speed}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.speed}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="stamina"
          value={values.skater.stamina}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.stamina}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="strength"
          value={values.skater.strength}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.strength}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="fighting"
          value={values.skater.fighting}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.fighting}
        />
      </AttributeSectionWrapper>
      <AttributeSectionWrapper heading="Mental Ratings">
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="aggression"
          value={values.skater.aggression}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.aggression}
        />
        <PlayerAttributeInput
          attributeFormFlags={attributeFormFlags}
          position={values.position}
          attribute="bravery"
          value={values.skater.bravery}
          role={role}
          setFieldValue={setFieldValue}
          handleBlur={handleBlur}
          availableTPE={values.availableTPE ?? 0}
          initialValue={initialValues.bravery}
        />
        <PlayerAttributeInput
          isReadOnly
          position={values.position}
          attribute="determination"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position={values.position}
          attribute="teamPlayer"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position={values.position}
          attribute="leadership"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position={values.position}
          attribute="temperament"
          value={15}
        />
        <PlayerAttributeInput
          isReadOnly
          position={values.position}
          attribute="professionalism"
          value={15}
        />
      </AttributeSectionWrapper>
    </>
  );
};
