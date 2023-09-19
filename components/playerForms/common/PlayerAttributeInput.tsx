import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Tooltip,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { ReactiveNumberInput } from 'components/common/ReactiveNumberInput';
import {
  GOALIE_ATTRIBUTE_COSTS,
  SKATER_ATTRIBUTE_COSTS,
  MAXIMUM_ATTRIBUTE,
  MAX_ATTRIBUTE_COST,
  LIMITED_ATTRIBUTES,
  STARTING_TPE,
} from 'lib/constants';
import { capitalize } from 'lodash';
import { memo, useMemo } from 'react';
import { assertUnreachable } from 'utils/assertUnreachable';

import { AttributeFormFlags } from '../attributeForms/attributeFormFlags';
import {
  Position,
  PlayerRole,
  ROLE_ATTRIBUTES,
  ATTRIBUTE_LABEL_TOOLTIPS,
} from '../constants';
import {
  CreatePlayerFormValidation,
  CommonCreatePlayerFormProps,
} from '../shared';

type ReadOnlyGoalieAttributes =
  | 'aggression'
  | 'determination'
  | 'teamPlayer'
  | 'leadership'
  | 'professionalism';
type ReadOnlySkaterAttributes =
  | 'determination'
  | 'teamPlayer'
  | 'leadership'
  | 'temperament'
  | 'professionalism';

const DEFAULT_MIN = 5;
const DEFAULT_MAX = 20;

export const PlayerAttributeInput = memo(
  <P extends Position, R extends boolean = false>({
    position,
    role,
    attribute,
    isReadOnly,
    setFieldValue,
    availableTPE,
    value,
    handleBlur,
    initialValue = value,
    attributeFormFlags,
  }: {
    position: P;
    role?: PlayerRole;
    attribute: P extends 'Goalie'
      ? R extends false
        ? keyof CreatePlayerFormValidation['goalie']
        : ReadOnlyGoalieAttributes
      : R extends false
      ? keyof CreatePlayerFormValidation['skater']
      : ReadOnlySkaterAttributes;
    isReadOnly?: R;
    availableTPE?: number;
    value: number;
    attributeFormFlags?: AttributeFormFlags;
    initialValue?: number;
  } & Partial<
    Pick<CommonCreatePlayerFormProps, 'handleBlur' | 'setFieldValue'>
  >) => {
    const isGoalie = position === 'Goalie';

    const { readableAttribute, attributeCostMap, formValueName } = useMemo(
      () => ({
        readableAttribute: attribute.split(/(?=[A-Z])/g).join(' '),
        attributeCostMap: isGoalie
          ? GOALIE_ATTRIBUTE_COSTS
          : SKATER_ATTRIBUTE_COSTS,
        formValueName: `${isGoalie ? 'goalie' : 'skater'}.${attribute}`,
      }),
      [attribute, isGoalie],
    );

    const shouldHighlightForRole = useMemo(() => {
      if (isGoalie || isReadOnly || !role) {
        return false;
      }

      return ROLE_ATTRIBUTES[
        attribute as keyof typeof ROLE_ATTRIBUTES
      ].includes(role);
    }, [attribute, isGoalie, isReadOnly, role]);

    const nextIncrementCost = useMemo(() => {
      if (value === MAXIMUM_ATTRIBUTE) {
        return 0;
      }

      const currentValue = value as keyof typeof attributeCostMap;
      const updateValue = (value + 1) as keyof typeof attributeCostMap;

      const currentCost =
        attributeCostMap[currentValue]?.totalCost ??
        attributeCostMap[MAXIMUM_ATTRIBUTE];
      const attemptedUpdateCost =
        attributeCostMap[updateValue]?.totalCost ?? MAX_ATTRIBUTE_COST;

      return attemptedUpdateCost - currentCost;
    }, [attributeCostMap, value]);

    const totalCost = useMemo(() => {
      const currentValue = value as keyof typeof attributeCostMap;
      return (
        attributeCostMap[currentValue]?.totalCost -
        (attribute === 'stamina' ? 30 : 0)
      );
    }, [attribute, attributeCostMap, value]);

    const attributeDescription = useMemo(() => {
      const label = ATTRIBUTE_LABEL_TOOLTIPS[attribute] ?? '';
      const pipeDelimitedArray = String(label).split('|');
      if (pipeDelimitedArray.length > 1 && position === 'Goalie') {
        return pipeDelimitedArray[1];
      } else {
        return pipeDelimitedArray[0];
      }
    }, [attribute, position]);

    const { minimumValue, maximumValue } = useMemo(() => {
      const positionsForLimitedAttribute =
        LIMITED_ATTRIBUTES[attribute as keyof typeof LIMITED_ATTRIBUTES]
          ?.positions ?? [];

      let minMaxValues = {
        minimumValue: DEFAULT_MIN,
        maximumValue: DEFAULT_MAX,
      };

      if (isReadOnly || !attributeFormFlags) {
        return minMaxValues;
      }

      if ([...positionsForLimitedAttribute].includes(position)) {
        const currAttribute = attribute as keyof typeof LIMITED_ATTRIBUTES;
        minMaxValues = {
          minimumValue: LIMITED_ATTRIBUTES[currAttribute].min ?? DEFAULT_MIN,
          maximumValue: LIMITED_ATTRIBUTES[currAttribute].max ?? DEFAULT_MAX,
        };
      }

      switch (attributeFormFlags?.type) {
        case 'Create':
          return {
            minimumValue: minMaxValues.minimumValue,
            maximumValue:
              nextIncrementCost > Number(availableTPE ?? STARTING_TPE)
                ? value
                : minMaxValues.maximumValue,
          };
        case 'Update':
          return {
            minimumValue: initialValue,
            maximumValue:
              nextIncrementCost > Number(availableTPE ?? 0)
                ? value
                : minMaxValues.maximumValue,
          };
        case 'Redistribute':
          return {
            minimumValue: minMaxValues.minimumValue,
            maximumValue: initialValue,
          };
        case 'Regression':
          return {
            minimumValue:
              Number(availableTPE ?? 0) >= 0
                ? value
                : minMaxValues.minimumValue,
            maximumValue: initialValue,
          };
        default:
          assertUnreachable(attributeFormFlags.type as never);
          return minMaxValues;
      }
    }, [
      attribute,
      availableTPE,
      attributeFormFlags,
      initialValue,
      nextIncrementCost,
      position,
      value,
      isReadOnly,
    ]);

    return (
      <FormControl isReadOnly={isReadOnly}>
        <FormLabel
          className={classnames(
            'font-mont capitalize',
            shouldHighlightForRole && 'text-blue600',
          )}
        >
          <Tooltip
            isDisabled={!shouldHighlightForRole}
            label="This attribute is important for the role you have selected. Focusing on it will ensure your player will perform well in their position if this role is selected for them in the sim."
            placement="top"
            shouldWrapChildren={shouldHighlightForRole}
          >
            <>
              {shouldHighlightForRole && <span className="font-bold">!</span>}{' '}
              {capitalize(readableAttribute)}
            </>
          </Tooltip>
        </FormLabel>
        {isReadOnly ? (
          <Input value={value} disabled className="font-mont" />
        ) : (
          <ReactiveNumberInput
            label={readableAttribute}
            shouldHighlight={shouldHighlightForRole}
            onBlur={handleBlur}
            onChange={(_, value) =>
              setFieldValue &&
              setFieldValue(formValueName, isNaN(value) ? 0 : value)
            }
            value={value}
            name={formValueName}
            min={minimumValue}
            max={maximumValue}
            step={1}
            precision={0}
            allowMouseWheel
          />
        )}
        <FormHelperText className="flex flex-col font-mont">
          {!isReadOnly && (
            <div className="mb-2 flex items-center justify-between text-grey900">
              <div>Total Cost: {totalCost}</div>
              <div>
                <div>Next Point: {nextIncrementCost}</div>
              </div>
            </div>
          )}
          <div className="text-xs">{attributeDescription}</div>
        </FormHelperText>
      </FormControl>
    );
  },
);
