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

  return (
    <>
      <div className="flex items-center space-x-2 md:hidden">
        <IconButton
          aria-label={`Decrease value of ${label}`}
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
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </>
  );
};
