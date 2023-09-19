import { CheckIcon, CopyIcon } from '@chakra-ui/icons';
import { IconButton, IconButtonProps, useClipboard } from '@chakra-ui/react';

export const CopyButton = ({
  value,
  ...rest
}: {
  value: string;
} & IconButtonProps) => {
  const { onCopy, hasCopied } = useClipboard(value);

  return (
    <IconButton
      {...rest}
      icon={hasCopied ? <CheckIcon color="green" /> : <CopyIcon />}
      onClick={onCopy}
    />
  );
};
