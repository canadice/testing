import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Select,
  FormLabel,
  FormControl,
  FormErrorMessage,
  Input,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import classnames from 'classnames';
import { PermissionGuard } from 'components/auth/PermissionGuard';
import { Link } from 'components/common/Link';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { IndexPlayerIDTable } from 'components/common/tables/IndexPlayerIDTable';
import { LEAGUE_LINK_MAP } from 'components/playerForms/constants';
import { generateIndexLink } from 'components/playerForms/shared';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useRedirectIfUnauthed } from 'hooks/useRedirectIfUnauthed';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useState } from 'react';
import { IndexPlayerID, Player } from 'typings';
import { isValidID } from 'utils/isValidID';
import { mutate, query } from 'utils/query';

export default () => {
  const { loggedIn, session } = useSession();

  useRedirectIfUnauthed('/', { roles: ['HEAD_UPDATER', 'UPDATER'] });

  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/');
    }
  }, [loggedIn, router]);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['indexPlayers'],
    queryFn: () => query(`api/v1/player`, undefined),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const queryClient = useQueryClient();
  const { addToast } = useContext(ToastContext);

  const [actionedPlayer, setActionedPlayer] = useState<Player | undefined>();
  const [actionedRecord, setActionedRecord] = useState<
    Partial<IndexPlayerID> | undefined
  >();

  const [existingRecord, setExistingRecord] = useState<
    IndexPlayerID | undefined
  >();

  const [actionTaken, setActionTaken] = useState<
    'DELETE' | 'UPDATE' | 'CREATE' | undefined
  >();

  const setActionedPlayerCallback = useCallback(
    (
      action: 'DELETE' | 'UPDATE' | 'CREATE' | undefined,
      player: Player | undefined,
      record?: IndexPlayerID,
    ) => {
      setActionedPlayer(player);
      setActionTaken(action);
      setActionedRecord(record);
      setExistingRecord(record);
    },
    [],
  );

  const submitCreate = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/index-record/create', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleCreate = async () => {
    setIsSubmitting(true);
    const body = {
      indexRecord: { playerUpdateID: actionedPlayer?.pid, ...actionedRecord },
    };

    submitCreate.mutate(body, {
      onError: () => {
        addToast({
          title: `Error`,
          description: `Failed to created record for ${actionedPlayer?.name}`,
          status: 'error',
        });
      },
      onSuccess: () => {
        addToast({
          title: `Complete`,
          description: `Successfully created record for ${actionedPlayer?.name}`,
          status: 'success',
        });
        setActionedPlayerCallback(undefined, undefined, undefined);
        queryClient.invalidateQueries({ queryKey: ['indexPlayers'] });
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  const submitDelete = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/index-record/delete', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleDelete = async () => {
    setIsSubmitting(true);
    const body = {
      indexRecord: { playerUpdateID: actionedPlayer?.pid, ...actionedRecord },
    };

    submitDelete.mutate(body, {
      onError: () => {
        addToast({
          title: `Error`,
          description: `Failed to delete record for ${actionedPlayer?.name}`,
          status: 'error',
        });
      },
      onSuccess: () => {
        addToast({
          title: `Complete`,
          description: `Successfully deleted record for ${actionedPlayer?.name}`,
          status: 'success',
        });
        setActionedPlayerCallback(undefined, undefined, undefined);
        queryClient.invalidateQueries({ queryKey: ['indexPlayers'] });
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  const submitUpdate = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/index-record/update', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleUpdate = async () => {
    setIsSubmitting(true);
    const body = {
      existingRecord: {
        playerUpdateID: actionedPlayer?.pid,
        ...existingRecord,
      },
      updatedRecord: { playerUpdateID: actionedPlayer?.pid, ...actionedRecord },
    };

    submitUpdate.mutate(body, {
      onError: () => {
        addToast({
          title: `Error`,
          description: `Failed to update record for ${actionedPlayer?.name}`,
          status: 'error',
        });
      },
      onSuccess: () => {
        addToast({
          title: `Complete`,
          description: `Successfully updated record for ${actionedPlayer?.name}`,
          status: 'success',
        });
        setActionedPlayerCallback(undefined, undefined, undefined);
        queryClient.invalidateQueries({ queryKey: ['indexPlayers'] });
      },
      onSettled: () => {
        setIsSubmitting(false);
      },
    });
  };

  return (
    <>
      <PageWrapper
        title="Index ID Management"
        className="flex flex-col space-y-4"
      >
        <PageHeading>Index ID Management</PageHeading>
        <PermissionGuard userPermissions="canManagePlayerIndexIds">
          <IndexPlayerIDTable
            data={data ?? []}
            isLoading={isLoading}
            callback={setActionedPlayerCallback}
          />
        </PermissionGuard>
      </PageWrapper>
      <Modal
        size="md"
        isOpen={actionedPlayer !== undefined}
        onClose={() =>
          setActionedPlayerCallback(undefined, undefined, undefined)
        }
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{actionedPlayer?.name}</ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            <div className="mb-4 w-full flex-col space-y-4">
              <FormControl
                id="leagueID"
                isInvalid={!isValidID(actionedRecord?.leagueID)}
              >
                <FormLabel>League</FormLabel>
                {(!actionTaken || actionTaken === 'DELETE') &&
                (actionedRecord?.leagueID || actionedRecord?.leagueID === 0) ? (
                  <span>{LEAGUE_LINK_MAP[actionedRecord?.leagueID]}</span>
                ) : (
                  <Select
                    as="select"
                    name="leagueID"
                    defaultValue={actionedRecord?.leagueID}
                    placeholder="Select League"
                    onChange={(e) =>
                      setActionedRecord((prev) => ({
                        ...prev,
                        leagueID: parseInt(e.target?.value ?? 0),
                      }))
                    }
                  >
                    {LEAGUE_LINK_MAP.map((league, index) => (
                      <option key={league} value={index}>
                        {league}
                      </option>
                    ))}
                  </Select>
                )}
                <FormErrorMessage>
                  {!isValidID(actionedRecord?.leagueID)
                    ? 'League is required'
                    : ''}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                id="startSeason"
                isInvalid={Boolean(!actionedRecord?.startSeason)}
              >
                <FormLabel>Start Season</FormLabel>
                {(!actionTaken || actionTaken === 'DELETE') &&
                actionedRecord?.startSeason ? (
                  <span>{actionedRecord.startSeason}</span>
                ) : (
                  <Input
                    type="number"
                    name="startSeason"
                    defaultValue={actionedRecord?.startSeason}
                    onChange={(e) =>
                      setActionedRecord((prev) => ({
                        ...prev,
                        startSeason: parseInt(e.target?.value ?? 0),
                      }))
                    }
                  />
                )}
                <FormErrorMessage>
                  {!actionedRecord?.startSeason
                    ? 'Start season is required'
                    : ''}
                </FormErrorMessage>
              </FormControl>
              <FormControl
                id="indexId"
                isInvalid={Boolean(!actionedRecord?.indexID)}
              >
                <FormLabel>Index ID</FormLabel>
                {(!actionTaken || actionTaken === 'DELETE') &&
                isValidID(actionedRecord?.indexID) ? (
                  <span>{actionedRecord?.indexID}</span>
                ) : (
                  <Input
                    type="number"
                    name="indexId"
                    defaultValue={actionedRecord?.indexID}
                    isInvalid={!isValidID(actionedRecord?.indexID)}
                    onChange={(e) =>
                      setActionedRecord((prev) => ({
                        ...prev,
                        indexID: parseInt(e.target?.value ?? 0),
                      }))
                    }
                  />
                )}
                <FormErrorMessage>
                  {!isValidID(actionedRecord?.indexID)
                    ? 'Index ID is required'
                    : ''}
                </FormErrorMessage>
              </FormControl>
              {isValidID(actionedRecord?.indexID) &&
              isValidID(actionedRecord?.leagueID) &&
              actionedRecord?.startSeason ? (
                <Link
                  className="!hover:no-underline text-blue600"
                  target="_blank"
                  href={generateIndexLink(actionedRecord)}
                >
                  View index page
                </Link>
              ) : (
                <></>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className={classnames(
                'mr-2',
                actionedRecord && !actionTaken ? 'w-1/3' : 'w-1/2',
              )}
              onClick={
                actionTaken && actionTaken !== 'CREATE'
                  ? () => setActionTaken(undefined)
                  : () =>
                      setActionedPlayerCallback(undefined, undefined, undefined)
              }
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            {actionTaken === 'DELETE' ? (
              <>
                <Button
                  colorScheme="red"
                  type="button"
                  className="mr-2 w-1/2"
                  isLoading={isSubmitting}
                  onClick={handleDelete}
                >
                  Confirm Delete
                </Button>
              </>
            ) : (
              <>
                {actionedRecord && !actionTaken && (
                  <Button
                    colorScheme="red"
                    type="button"
                    className="mr-2 w-1/3"
                    isLoading={isSubmitting}
                    onClick={() => setActionTaken('DELETE')}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  colorScheme="blue"
                  type="button"
                  className={classnames(
                    actionedRecord && !actionTaken ? 'w-1/3' : 'w-1/2',
                  )}
                  isLoading={isSubmitting}
                  isDisabled={
                    !isValidID(actionedRecord?.indexID) ||
                    !isValidID(actionedRecord?.leagueID) ||
                    !actionedRecord?.startSeason
                  }
                  onClick={
                    actionTaken === 'CREATE'
                      ? handleCreate
                      : actionTaken === 'UPDATE'
                      ? handleUpdate
                      : () => setActionTaken('UPDATE')
                  }
                >
                  {!actionTaken ? 'Edit' : 'Save'}
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
