import { MinusIcon, AddIcon } from '@chakra-ui/icons';
import {
  useNumberInput,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputProps,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { useMemo } from 'react';

export const ReactiveNumberInput = ({
  label,
  shouldHighlight,
  ...props
}: NumberInputProps & {
  shouldHighlight?: boolean;
  label: string;
}) => {
  const { getInputProps, getIncrementButtonProps, getDecrementButtonProps } =
    useNumberInput({
      ...props,
    });

  const isIncreaseDisabled = useMemo(
    () => props.isDisabled || (props.value ?? 0) >= (props.max ?? 0),
    [props.value, props.max, props.isDisabled],
  );

  const isDecreaseDisabled = useMemo(
    () => props.isDisabled || (props.value ?? 0) <= (props.min ?? 0),
    [props.value, props.min, props.isDisabled],
  );

  const incrementStyle = useMemo(
    () =>
      isIncreaseDisabled
        ? {}
        : {
            bg: 'green.100',
            _active: { bg: 'green.200' },
            _hover: { bg: 'green.200' },
          },
    [isIncreaseDisabled],
  );

  const decrementStyle = useMemo(
    () =>
      isDecreaseDisabled
        ? {}
        : {
            bg: 'pink.100',
            _active: { bg: 'pink.200' },
            _hover: { bg: 'pink.200' },
          },
    [isDecreaseDisabled],
  );

  return (
    <>
      <div className="flex items-center space-x-2 md:hidden">
        <IconButton
          aria-label={`Decrease value of ${label}`}
          colorScheme={isDecreaseDisabled ? 'gray' : 'red'}
          icon={<MinusIcon />}
          {...getDecrementButtonProps()}
        />
        <Input
          {...getInputProps()}
          className={classnames(
            shouldHighlight && '!border-blue600',
            'font-mont',
          )}
        />
        <IconButton
          aria-label={`Increase value of ${label}`}
          colorScheme={isIncreaseDisabled ? 'gray' : 'green'}
          icon={<AddIcon />}
          {...getIncrementButtonProps()}
        />
      </div>
      <NumberInput
        {...props}
        className={classnames(
          'hidden w-full font-mont md:flex',
          shouldHighlight && '!border-blue600',
        )}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper {...incrementStyle} />
          <NumberDecrementStepper {...decrementStyle} />
        </NumberInputStepper>
      </NumberInput>
    </>
  );
};
