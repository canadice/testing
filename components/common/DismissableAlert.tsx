import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  CloseButton,
  Box,
  AlertProps,
} from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

export const DismissableAlert = ({
  title,
  onClose,
  isOpen,
  children,
  ...rest
}: PropsWithChildren<
  { title?: string; isOpen: boolean; onClose: () => void } & AlertProps
>) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Alert {...rest}>
      <AlertIcon />
      <Box className="w-full">
        {title && <AlertTitle>{title}</AlertTitle>}
        <AlertDescription>{children}</AlertDescription>
      </Box>
      <CloseButton
        alignSelf="flex-start"
        position="relative"
        right={-1}
        top={-1}
        onClick={onClose}
      />
    </Alert>
  );
};
