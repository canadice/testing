import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useRetirementMutation } from 'hooks/useRetirementMutation';
import { useUpdateEvents } from 'hooks/useUpdateEvents';
import { useMemo, useState } from 'react';

export const UnretireAlert = ({ isDisabled }: { isDisabled: boolean }) => {
  const { player, canUnretire, status } = useCurrentPlayer();
  const [createNew, setCreateNew] = useState(false);

  const { updateFlags, loading: updateEventsLoading } = useUpdateEvents(
    player?.pid,
  );

  const shouldShowUnretireMessage = useMemo(
    () =>
      canUnretire &&
      !updateEventsLoading &&
      !updateFlags.unRetirementProcessed &&
      !createNew,

    [createNew, canUnretire, updateEventsLoading, updateFlags],
  );

  const { submitRetire, isSubmitting: isUnretireSubmitted } =
    useRetirementMutation(player?.pid, 'unretire');

  const [isUnretirementModalOpen, setIsUnretirementModalOpen] = useState(false);
  const [unretirementConfirmationText, setUnretirementConfirmationText] =
    useState('');

  if (!shouldShowUnretireMessage) return null;

  if (status === 'denied') return null;

  return (
    <>
      <Alert
        status="info"
        variant="top-accent"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        <AlertIcon />
        <AlertTitle>You have a recently retired player</AlertTitle>
        <AlertDescription fontSize="md">
          You can still choose to unretire {player?.name}. By doing so you will
          incur a 15% TPE penalty.{' '}
          {updateFlags.retirementProcessed
            ? 'As you have already unretired this character once, this would be the final unretirement. Any future retirement would be final.'
            : ''}
          <div className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              isDisabled={isDisabled}
              onClick={() => setIsUnretirementModalOpen(true)}
            >
              Unretire Player
            </Button>
            <Button
              colorScheme="blue"
              type="button"
              className="w-1/2"
              isDisabled={isDisabled}
              onClick={() => setCreateNew(true)}
            >
              Create New Player
            </Button>
          </div>
        </AlertDescription>
      </Alert>
      <Modal
        size="lg"
        isOpen={isUnretirementModalOpen}
        onClose={() => setIsUnretirementModalOpen(false)}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Unretire Player</ModalHeader>
          <ModalCloseButton isDisabled={isUnretireSubmitted} />
          <ModalBody>
            <Alert variant="subtle" status="error" className="mb-4">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Are you sure you want to unretire? There will be a 15% TPE
                penalty applied to your player.
                <br />
                Enter your player name below to proceed.
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
              onChange={(e) =>
                setUnretirementConfirmationText(e.currentTarget.value)
              }
            ></Input>
          </ModalBody>
          <ModalFooter className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              isDisabled={isUnretireSubmitted}
              onClick={() => setIsUnretirementModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="button"
              className="w-1/2"
              isDisabled={
                unretirementConfirmationText !== player?.name ||
                isUnretireSubmitted
              }
              isLoading={isUnretireSubmitted}
              onClick={submitRetire}
            >
              Unretire Player
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
