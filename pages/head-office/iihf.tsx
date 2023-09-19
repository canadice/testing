import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Alert,
  AlertIcon,
  AlertDescription,
  ModalFooter,
  Button,
  Select,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PermissionGuard } from 'components/auth/PermissionGuard';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { IIHFPlayerTable } from 'components/common/tables/IIHFPlayerTable';
import { COUNTRIES } from 'components/playerForms/constants';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useRedirectIfUnauthed } from 'hooks/useRedirectIfUnauthed';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Player } from 'typings';
import { mutate, query } from 'utils/query';

export default () => {
  const { loggedIn, session } = useSession();

  useRedirectIfUnauthed('/', { roles: ['IIHF_COMMISSIONER', 'IIHF_HO'] });

  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/');
    }
  }, [loggedIn, router]);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['iihfPlayers'],
    queryFn: () => query(`api/v1/player?status=active`, undefined),
  });

  const queryClient = useQueryClient();
  const { addToast } = useContext(ToastContext);

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>(
    undefined,
  );

  const setActionedPlayerCallback = useCallback(
    (player: Player | undefined) => setActionedPlayer(player),
    [],
  );

  const [selectedNation, setSelectedNation] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitChange = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/iihf-nation', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    submitChange.mutate(
      {
        pid: actionedPlayer?.pid,
        nation: selectedNation,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not assign ${actionedPlayer?.name} to ${selectedNation}. Please try again.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${actionedPlayer?.name} successfully assigned to ${selectedNation}`,
            status: 'success',
          });
          setActionedPlayer(undefined);
          setSelectedNation('');
          queryClient.invalidateQueries({ queryKey: ['iihfPlayers'] });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <>
      <PageWrapper title="IIHF Head Office" className="flex flex-col space-y-4">
        <PageHeading>IIHF Management</PageHeading>
        <PermissionGuard userPermissions="canAssignPlayerIIHFNation">
          <IIHFPlayerTable
            data={data ?? []}
            isLoading={isLoading}
            callback={setActionedPlayerCallback}
          />
        </PermissionGuard>
      </PageWrapper>
      <Modal
        size="md"
        isOpen={actionedPlayer !== undefined}
        onClose={() => setActionedPlayerCallback(undefined)}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionedPlayer?.name} - {actionedPlayer?.iihfNation}
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            <Alert variant="subtle" status="info" className="mb-4">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                Current editing IIHF Federation for {actionedPlayer?.name}, who
                is currently{' '}
                {actionedPlayer?.iihfNation
                  ? `assigned to ${actionedPlayer?.iihfNation}.`
                  : 'unassigned.'}
                <br />
                Select the new IIHF Federation below to proceed.
              </AlertDescription>
            </Alert>
            <Select
              onChange={(e) => setSelectedNation(e.target.value)}
              placeholder="Select a federation..."
            >
              {COUNTRIES.map((country) => {
                if (country !== 'Other') {
                  return (
                    <option
                      key={country}
                      selected={country === actionedPlayer?.iihfNation}
                      value={country}
                    >
                      {country}
                    </option>
                  );
                }
              })}
            </Select>
          </ModalBody>
          <ModalFooter className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              onClick={() => setActionedPlayer(undefined)}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="button"
              className="w-1/2"
              isDisabled={!selectedNation.length}
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
