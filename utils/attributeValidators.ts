import { AttributeChange } from 'components/playerForms/editAttributes/EditAttributesForm';
import { LIMITED_ATTRIBUTES } from 'lib/constants';
import { GoalieAttributes, Player, SkaterAttributes } from 'typings';

export const isValidIncrease = (
  changes: AttributeChange[],
  info: Player,
  goalie?: GoalieAttributes,
  skater?: SkaterAttributes,
) =>
  isValid('Increase', changes, info, goalie, skater) &&
  !isInvalidLimitedAttributes(changes, info);

export const isValidDecrease = (
  changes: AttributeChange[],
  info: Player,
  goalie?: GoalieAttributes,
  skater?: SkaterAttributes,
) => isValid('Decrease', changes, info, goalie, skater);

const isValid = (
  type: 'Increase' | 'Decrease',
  changes: AttributeChange[],
  info: Player,
  goalie?: GoalieAttributes,
  skater?: SkaterAttributes,
) => {
  return (
    !changes.some((update) =>
      info.position === 'Goalie'
        ? (goalie as GoalieAttributes)[
            update.attribute as keyof GoalieAttributes
          ] !== update.newValue
        : (skater as SkaterAttributes)[
            update.attribute as keyof SkaterAttributes
          ] !== update.newValue,
    ) &&
    !changes.some((update) =>
      info.position === 'Goalie'
        ? (goalie as GoalieAttributes)[
            update.attribute as keyof GoalieAttributes
          ] === undefined
        : (skater as SkaterAttributes)[
            update.attribute as keyof SkaterAttributes
          ] === undefined,
    ) &&
    (type === 'Increase'
      ? !changes.some((update) => update.newValue < update.oldValue)
      : !changes.some((update) => update.newValue > update.oldValue))
  );
};

const isInvalidLimitedAttributes = (changes: AttributeChange[], info: Player) =>
  changes.some((change) => {
    if (
      LIMITED_ATTRIBUTES[change.attribute as keyof typeof LIMITED_ATTRIBUTES]
    ) {
      const positionsForLimitedAttribute =
        LIMITED_ATTRIBUTES[change.attribute as keyof typeof LIMITED_ATTRIBUTES]
          ?.positions ?? [];

      if ([...positionsForLimitedAttribute].includes(info.position)) {
        return (
          change.newValue >
          LIMITED_ATTRIBUTES[
            change.attribute as keyof typeof LIMITED_ATTRIBUTES
          ].max
        );
      }
    }
    return false;
  });
