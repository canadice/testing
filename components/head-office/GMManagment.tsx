import { CheckIcon, CloseIcon, EditIcon, MinusIcon } from '@chakra-ui/icons';
import {
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Progress,
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CopyButton } from 'components/common/CopyButton';
import { UsernameSearch } from 'components/common/UsernameSearch';
import { TeamLogo } from 'components/TeamLogo';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { useCallback, useContext, useMemo, useState } from 'react';
import { Team, GeneralManager, UserInfo } from 'typings';
import { mutate } from 'utils/query';

type TeamWithManagers = Team &
  Pick<GeneralManager, 'gmID' | 'cogmID' | 'gmUsername' | 'cogmUsername'>;

type ActionTypes = 'GM' | 'COGM' | 'DELETE';

export const GMManagement = ({
  leagueID,
  managers,
}: {
  leagueID: number;
  managers: GeneralManager[];
}) => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const { shlTeams, smjhlTeams, loading: teamsLoading } = useTeamInfo();

  const leagueTeams = useMemo(
    () => (leagueID === 0 ? shlTeams : smjhlTeams),
    [leagueID, shlTeams, smjhlTeams],
  );

  const teamData = useMemo(() => {
    if (leagueTeams) {
      return leagueTeams?.map((team) => {
        const managerData = managers?.find((mgr) => mgr.teamID === team.id);
        return {
          ...team,
          gmID: managerData?.gmID ?? 0,
          gmUsername: managerData?.gmUsername ?? '',
          cogmID: managerData?.cogmID ?? '',
          cogmUsername: managerData?.cogmUsername ?? '',
        };
      }) as TeamWithManagers[];
    } else {
      return undefined;
    }
  }, [managers, leagueTeams]);

  const [isEditing, setIsEditing] = useState<
    { teamID: number; type: 'GM' | 'COGM' } | undefined
  >();

  const [actionedUser, setActionedUser] = useState<
    | {
        userID: number;
        username: string;
        teamID: number;
        teamName: string;
        type: ActionTypes;
      }
    | undefined
  >();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitManagerChange = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/manager/change', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    submitManagerChange.mutate(
      {
        leagueID,
        teamID: actionedUser?.teamID,
        userID: actionedUser?.userID,
        type: actionedUser?.type,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: `Could not complete ${
              actionedUser?.type === 'GM'
                ? 'General Manager'
                : 'Co-General Manager'
            } ${actionedUser?.type === 'DELETE' ? 'deletion' : 'change'}.`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `${
              actionedUser?.type === 'GM'
                ? 'General Manager'
                : 'Co-General Manager'
            } successfully ${
              actionedUser?.type === 'DELETE'
                ? 'deleted'
                : `changed to ${actionedUser?.username}`
            } for the ${actionedUser?.teamName}.`,
            status: 'success',
          });
          setIsModalOpen(false);
          if (isEditing) {
            setIsEditing(undefined);
          }
          setActionedUser(undefined);
          queryClient.invalidateQueries({ queryKey: ['managementManagers'] });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  }, [
    actionedUser?.teamID,
    actionedUser?.teamName,
    actionedUser?.type,
    actionedUser?.userID,
    actionedUser?.username,
    addToast,
    isEditing,
    leagueID,
    queryClient,
    submitManagerChange,
  ]);

  const setActionedUserFromSearch = useCallback(
    (user: UserInfo, teamID: number, teamName: string, type: ActionTypes) =>
      setActionedUser({
        userID: user.userID,
        username: user.username,
        teamID: Number(teamID),
        teamName,
        type,
      }),
    [],
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [validationText, setValidationText] = useState('');

  const teamRows = useMemo(() => {
    if (teamData) {
      return teamData?.map((team) => (
        <Tr
          key={team.id}
          borderLeftColor={team.colors.primary}
          className="border-2 border-l-8"
        >
          <Td minWidth="100px">
            <TeamLogo
              teamAbbreviation={team.abbreviation}
              league={leagueID === 0 ? 'shl' : 'smjhl'}
              className="max-h-12 lg:max-h-16"
            />
          </Td>
          <Td>{team.name}</Td>
          <Td>
            {isEditing?.teamID === team.id && isEditing.type === 'GM' ? (
              <div className="flex space-x-2">
                <UsernameSearch
                  handleClick={(user) =>
                    setActionedUserFromSearch(user, team.id, team.name, 'GM')
                  }
                  position="absolute"
                />
                <IconButton
                  variant="outline"
                  colorScheme="green"
                  isDisabled={
                    actionedUser?.userID === team.gmID || !actionedUser
                  }
                  icon={<CheckIcon />}
                  aria-label={`Submit change for general manager of the ${team.name}`}
                  onClick={() => setIsModalOpen(true)}
                />
                <IconButton
                  variant="outline"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  aria-label={`Cancel change for general manager of the ${team.name}`}
                  onClick={() => setIsEditing(undefined)}
                />
              </div>
            ) : (
              <div className="space-x-2">
                <IconButton
                  variant="outline"
                  colorScheme="blue"
                  icon={<EditIcon />}
                  aria-label={`Change general manager for the ${team.name}`}
                  onClick={() => setIsEditing({ teamID: team.id, type: 'GM' })}
                />
                <span>{team.gmUsername}</span>
              </div>
            )}
          </Td>
          <Td>
            {isEditing?.teamID === team.id && isEditing.type === 'COGM' ? (
              <div className="flex space-x-2">
                <UsernameSearch
                  handleClick={(user) =>
                    setActionedUserFromSearch(user, team.id, team.name, 'COGM')
                  }
                  position="absolute"
                />
                <IconButton
                  variant="outline"
                  colorScheme="green"
                  isDisabled={
                    actionedUser?.userID === team.cogmID || !actionedUser
                  }
                  icon={<CheckIcon />}
                  aria-label={`Submit change for co-general manager of the ${team.name}`}
                  onClick={() => setIsModalOpen(true)}
                />
                <IconButton
                  variant="outline"
                  colorScheme="red"
                  icon={<CloseIcon />}
                  aria-label={`Cancel change for co-general manager of the ${team.name}`}
                  onClick={() => setIsEditing(undefined)}
                />
              </div>
            ) : (
              <div className="space-x-2">
                <IconButton
                  variant="outline"
                  colorScheme="blue"
                  icon={<EditIcon />}
                  aria-label={`Change co-general manager for the ${team.name}`}
                  onClick={() =>
                    setIsEditing({ teamID: team.id, type: 'COGM' })
                  }
                />
                {team.cogmUsername && (
                  <IconButton
                    variant="outline"
                    colorScheme="red"
                    icon={<MinusIcon />}
                    aria-label={`Remove co-general manager from the ${team.name}`}
                    onClick={() => {
                      setActionedUser({
                        userID: team.cogmID,
                        username: team.cogmUsername,
                        teamID: team.id,
                        teamName: team.name,
                        type: 'DELETE',
                      });
                      setIsModalOpen(true);
                    }}
                  />
                )}
                <span>{team.cogmUsername}</span>
              </div>
            )}
          </Td>
        </Tr>
      ));
    } else {
      return null;
    }
  }, [
    teamData,
    leagueID,
    isEditing?.teamID,
    isEditing?.type,
    actionedUser,
    setActionedUserFromSearch,
  ]);

  return (
    <>
      <TableContainer overflowY="visible">
        <Table variant="striped">
          <Thead>
            <Tr className="w-full">
              <Th colSpan={2} className="w-1/3">
                Team
              </Th>
              <Th className="w-1/3">General Manager</Th>
              <Th className="w-1/3">Co-General Manager</Th>
            </Tr>
          </Thead>
          {teamsLoading && <Progress size="xs" isIndeterminate />}
          <Tbody>{teamRows}</Tbody>
        </Table>
      </TableContainer>
      <Modal
        size="md"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {actionedUser?.teamName} - {actionedUser?.username}
          </ModalHeader>
          <ModalCloseButton isDisabled={isSubmitting} />
          <ModalBody>
            <Alert variant="subtle" status="error" className="mb-4">
              <AlertIcon />
              <AlertDescription fontSize="sm">
                {actionedUser?.type === 'DELETE'
                  ? `Are you sure you want to remove ${actionedUser?.username} from the position of Co-General Manager of the ${actionedUser?.teamName}?`
                  : `Are you sure you want to assign ${
                      actionedUser?.username
                    } as ${
                      actionedUser?.type === 'GM'
                        ? 'General Manager'
                        : 'Co-General Manager'
                    } of the ${actionedUser?.teamName}?`}
                <br />
                Enter the users name below to proceed.
                <CopyButton
                  className="ml-2"
                  aria-label="Copy username to clipboard"
                  colorScheme="blackAlpha"
                  size="sm"
                  variant="unstyled"
                  value={actionedUser?.username ?? ''}
                />
              </AlertDescription>
            </Alert>
            <Input
              onChange={(e) => setValidationText(e.currentTarget.value)}
            ></Input>
          </ModalBody>
          <ModalFooter className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              onClick={() => {
                setIsModalOpen(false);
                setActionedUser(undefined);
              }}
              isDisabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="button"
              className="w-1/2"
              isDisabled={validationText !== actionedUser?.username}
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
