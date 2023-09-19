import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { CopyButton } from 'components/common/CopyButton';
import { PropsWithChildren, useState } from 'react';
import { Player } from 'typings';

export const ActionModal = ({
  action,
  player,
  setPlayer,
  callback,
  isSubmitting,
  children,
}: PropsWithChildren<{
  action: string;
  player: Player | undefined;
  setPlayer: (player: Player | undefined) => void;
  callback: () => Promise<void>;
  isSubmitting: boolean;
}>) => {
  useState<boolean>(false);
  const [validationText, setValidationText] = useState<string>('');

  const processAction = async () => {
    if (player) {
      await callback();
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={player !== undefined}
      onClose={() => setPlayer(undefined)}
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{action} Player</ModalHeader>
        <ModalCloseButton isDisabled={isSubmitting} />
        <ModalBody>
          <Alert variant="subtle" status="error" className="mb-4">
            <AlertIcon />
            <AlertDescription fontSize="sm">
              Are you sure you want to {action.toLowerCase()} {player?.name}?{' '}
              <br />
              Enter the player name below to proceed.
              <CopyButton
                className="ml-2"
                aria-label="Copy player name to clipboard"
                colorScheme="blackAlpha"
                size="sm"
                variant="unstyled"
                value={player?.name ?? ''}
              />
            </AlertDescription>
          </Alert>
          <Input
            onChange={(e) => setValidationText(e.currentTarget.value)}
          ></Input>
          {children}
        </ModalBody>
        <ModalFooter className="bottom-0 flex items-center p-2">
          <Button
            colorScheme="gray"
            type="button"
            className="mr-2 w-1/2"
            onClick={() => setPlayer(undefined)}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="button"
            className="w-1/2"
            isDisabled={validationText !== player?.name}
            isLoading={isSubmitting}
            onClick={processAction}
          >
            {action} Player
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
