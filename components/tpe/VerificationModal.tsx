import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { DismissableAlert } from 'components/common/DismissableAlert';
import { TPESubmissionTableReadOnly } from 'components/common/tables/TPESubmissionTableReadOnly';
import { useEffect, useState } from 'react';
import { TPESubmission } from 'typings';

export const VerificationModal = ({
  isOpen,
  isSubmitting,
  pendingUpdates,
  closeModal,
  handleSubmit,
}: {
  isOpen: boolean;
  isSubmitting: boolean;
  pendingUpdates: TPESubmission[];
  closeModal: () => void;
  handleSubmit: () => Promise<void>;
}) => {
  const [excessiveUpdates, setExcessiveUpdates] = useState<string[]>([]);

  useEffect(() => {
    setExcessiveUpdates(
      pendingUpdates
        .filter((update) => update.TPEChange >= 20)
        .map((update) => update.playerName),
    );
  }, [isOpen, pendingUpdates]);

  return (
    <Modal
      size={'3xl'}
      isOpen={isOpen}
      isCentered
      scrollBehavior="inside"
      onClose={closeModal}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Review TPE Submissions</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <DismissableAlert
            variant="subtle"
            status="error"
            className="mb-4"
            isOpen={excessiveUpdates.length > 0}
            onClose={() => setExcessiveUpdates([])}
          >
            <span className="text-lg">
              The following Players have 20 or more TPE in this update:
            </span>
            <br />
            <UnorderedList>
              {excessiveUpdates.map((playerName) => (
                <ListItem key={playerName} className="font-mont">
                  {playerName}
                </ListItem>
              ))}
            </UnorderedList>
          </DismissableAlert>
          <TPESubmissionTableReadOnly data={pendingUpdates} />
        </ModalBody>
        <ModalFooter className="bottom-0 flex items-center p-2">
          <Button
            colorScheme="gray"
            type="button"
            className="mr-2 w-1/2"
            onClick={closeModal}
            isDisabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            colorScheme="green"
            type="submit"
            className="w-1/2"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
