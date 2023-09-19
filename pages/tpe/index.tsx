import {
  Button,
  Divider,
  FormControl,
  FormErrorMessage,
  Input,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { RoleGuard } from 'components/auth/RoleGuard';
import { CSVUpload } from 'components/common/CSVUpload';
import { DismissableAlert } from 'components/common/DismissableAlert';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { SubHeading } from 'components/common/SubHeading';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { TPESubmissionTable } from 'components/common/tables/TPESubmissionTable';
import { PLAYER_TASK_STATUS } from 'components/playerForms/constants';
import { AllTPEEvents } from 'components/tpe/AllTPEEvents';
import { VerificationModal } from 'components/tpe/VerificationModal';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useRedirectIfUnauthed } from 'hooks/useRedirectIfUnauthed';
import { useUsers } from 'hooks/useUsers';
import { startCase } from 'lodash';
import _ from 'lodash';
import { memo, useCallback, useContext, useMemo, useState } from 'react';
import { Player, TPESubmission, UserInfo } from 'typings';
import { mutate, query } from 'utils/query';

type TPEEventCSV = { uid: number; tpe: number };

type TaskType =
  | 'point task'
  | 'fantasy'
  | 'recruitment'
  | 'correction'
  | 'other';

const TASK_TYPES = [
  'point task',
  'fantasy',
  'recruitment',
  'correction',
  'other',
];

const organizeSubmissionsByUid = (
  submissions: TPESubmission[],
): { records: TPESubmission[]; hasDuplicates: boolean } => {
  const groupedSubmissions = _.groupBy(submissions, 'uid');
  const duplicatedSubmissions = Object.values(groupedSubmissions).filter(
    (group) => group.length > 1,
  );

  const duplicatedSubmissionsWithDuplicatePrefix = _.flatMap(
    duplicatedSubmissions,
    (group) =>
      group.map((submission, index) => ({
        ...submission,
        tempID:
          index > 0 ? `duplicate-${submission.tempID}` : submission.tempID,
      })),
  );

  const nonDuplicatedSubmissions = submissions.filter(
    (submission) =>
      !groupedSubmissions[submission.uid] ||
      groupedSubmissions[submission.uid].length === 1,
  );

  return {
    records: duplicatedSubmissionsWithDuplicatePrefix.concat(
      nonDuplicatedSubmissions,
    ),
    hasDuplicates: duplicatedSubmissionsWithDuplicatePrefix.length > 0,
  };
};

export default () => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);

  useRedirectIfUnauthed('/', {
    roles: [
      'PT_GRADER',
      'SHL_HO',
      'SMJHL_HO',
      'SHL_COMMISSIONER',
      'SMJHL_COMMISSIONER',
      'SMJHL_INTERN',
    ],
  });

  const [playerType, setPlayerType] = useState<string>('Everyone');
  const [taskType, setTaskType] = useState<TaskType>('point task');
  const [taskDescription, setTaskDescription] = useState<string>('');
  const [taskThread, setTaskThread] = useState<string | null>(null);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const { users } = useUsers();

  const closeModal = useCallback(() => setIsVerificationModalOpen(false), []);

  const { data = [], isLoading } = useQuery<Player[]>({
    queryKey: ['tpePlayers', playerType],
    queryFn: () =>
      query(
        `api/v1/player?status=active${
          playerType !== 'Everyone' ? `&taskStatus='${playerType}'` : ''
        }`,
        undefined,
      ),
    enabled: playerType !== undefined,
  });

  const [pendingUpdates, setPendingUpdates] = useState<TPESubmission[]>([]);
  const [erroredUpdates, setErroredUpdates] = useState<UserInfo[]>([]);
  const [submissionErrors, setSubmissionErrors] = useState<Player[]>([]);

  const submitTPEEvents = useMutation<
    // TODO: type return type
    unknown,
    { message: string },
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/tpeevents/create', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const params = new URLSearchParams(taskThread ?? '');
    const taskThreadID = params.get(
      'https://simulationhockey.com/showthread.php?tid',
    );

    const events = pendingUpdates.map((event) => ({
      pid: event.pid,
      TPEChange: event.TPEChange,
      taskType,
      taskDescription,
      taskThreadID,
    }));

    submitTPEEvents.mutate(
      {
        taskStatus: playerType,
        events,
      },
      {
        onError: ({ message }) => {
          const response = JSON.parse(message);
          setSubmissionErrors(response.invalidTaskStatus);
          addToast({
            title: `Error`,
            description: 'Please see error for more details.',
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: 'TPE Events successfully submitted.',
            status: 'success',
          });
          setIsVerificationModalOpen(false);
          setPendingUpdates([]);
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  const setUpdatedFromCSV = useCallback(
    (events: TPEEventCSV[]) => {
      const erroneousEvents: UserInfo[] = [];
      const validEvents: TPESubmission[] = [];

      events.forEach((event) => {
        const player = data?.find((player) => player.uid === Number(event.uid));
        if (player) {
          validEvents.push({
            tempID: crypto.randomUUID(),
            uid: event.uid,
            username: player.username,
            playerName: player.name,
            pid: player.pid,
            TPEChange: event.tpe,
          } as TPESubmission);
        } else {
          erroneousEvents.push(
            users.find((user) => user.userID === Number(event.uid)) ?? {
              userID: event.uid,
              username: 'Not Found',
            },
          );
        }
      });
      setPendingUpdates((prev) => [...prev, ...validEvents]);
      setErroredUpdates((prev) => [...prev, ...erroneousEvents]);
    },
    [data, users],
  );

  const changePlayerType = useCallback((value: string) => {
    setPendingUpdates([]);
    setErroredUpdates([]);
    setSubmissionErrors([]);
    setPlayerType(value);
  }, []);

  const addSelectedPlayer = useCallback((player: Player) => {
    setPendingUpdates((prev) => [
      ...prev,
      {
        tempID: crypto.randomUUID(),
        uid: player.uid,
        username: player.username,
        playerName: player.name,
        pid: player.pid,
        TPEChange: 0,
      },
    ]);
  }, []);

  const deleteSelectedEvent = useCallback((event: TPESubmission) => {
    setPendingUpdates((prev) =>
      prev.filter(
        (sub) => sub.tempID !== event.tempID.replace('duplicate-', ''),
      ),
    );
  }, []);

  const changeSelectedEvent = useCallback(
    (event: TPESubmission, value: string) => {
      if (Number(value) !== event.TPEChange) {
        setPendingUpdates((prev) => {
          return prev.map((sub) => {
            if (sub.tempID === event.tempID) {
              return { ...event, TPEChange: Number(value) };
            } else {
              return sub;
            }
          });
        });
      }
    },
    [],
  );

  const pendingUpdateIDs = useMemo(
    () => pendingUpdates.map((update) => update.uid),
    [pendingUpdates],
  );

  const parsedSubmissionData = useMemo(
    () => organizeSubmissionsByUid(pendingUpdates),
    [pendingUpdates],
  );

  const MemoizedTPESubmissionTable = memo(() => (
    <TPESubmissionTable
      data={parsedSubmissionData.records}
      changeCallback={changeSelectedEvent}
      deleteCallback={deleteSelectedEvent}
    />
  ));

  return (
    <PageWrapper title="TPE Management" className="flex flex-col space-y-4">
      <PageHeading>TPE Management</PageHeading>
      <RoleGuard
        userRoles={[
          'PT_GRADER',
          'SHL_HO',
          'SMJHL_HO',
          'SHL_COMMISSIONER',
          'SMJHL_COMMISSIONER',
          'SMJHL_INTERN',
        ]}
      >
        <Tabs isLazy>
          <TabList>
            <Tab>Submission</Tab>
            <Tab>Reporting</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-3">
                <div>
                  <label htmlFor="taskType">Task Type:</label>
                  <Select
                    id="taskType"
                    name="taskType"
                    onChange={(e) =>
                      setTaskType(e.currentTarget.value as TaskType)
                    }
                  >
                    {TASK_TYPES.map((type, index) => (
                      <option key={index} value={type}>
                        {startCase(type)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label htmlFor="taskDescription">Task Description:</label>
                  <Input
                    type="text"
                    id="taskDescription"
                    name="taskDescription"
                    onBlur={(e) => setTaskDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="taskThread">Task Thread:</label>
                  <FormControl
                    isInvalid={
                      typeof taskThread === 'string' && taskThread !== ''
                        ? !taskThread?.startsWith(
                            'https://simulationhockey.com/showthread.php?tid=',
                          )
                        : false
                    }
                  >
                    <Input
                      id="taskThread"
                      name="taskThread"
                      onBlur={(e) => setTaskThread(e.target.value)}
                    />
                    <FormErrorMessage>
                      Must enter a valid forum thread
                    </FormErrorMessage>
                  </FormControl>
                </div>

                <div>
                  <label htmlFor="playerGroup">Eligible Players:</label>
                  <Select
                    id="playerGroup"
                    isDisabled={isLoading}
                    name="playerGroup"
                    onChange={(e) => changePlayerType(e.currentTarget.value)}
                  >
                    <option>Everyone</option>
                    <option value={PLAYER_TASK_STATUS.ROOKIE}>
                      {PLAYER_TASK_STATUS.ROOKIE}
                    </option>
                    <option value={PLAYER_TASK_STATUS.SHL}>
                      {PLAYER_TASK_STATUS.SHL}
                    </option>
                  </Select>
                </div>

                <div>
                  <label htmlFor="csvUpload">CSV Upload:</label>
                  <div>
                    <CSVUpload<TPEEventCSV>
                      onDataUpload={setUpdatedFromCSV}
                      expectedHeaders={['uid', 'tpe']}
                    />
                  </div>
                </div>
              </div>

              <DismissableAlert
                variant="subtle"
                status="error"
                className="my-4"
                title={`The following Users are ineligible for task type ${playerType}:`}
                isOpen={erroredUpdates.length > 0}
                onClose={() => setErroredUpdates([])}
              >
                <span className="font-mont">
                  {erroredUpdates.map((event) => (
                    <p key={event.userID}>
                      {event.userID} - {event.username}
                    </p>
                  ))}
                </span>
              </DismissableAlert>

              <DismissableAlert
                variant="subtle"
                status="error"
                className="my-4"
                isOpen={submissionErrors.length > 0}
                onClose={() => setSubmissionErrors([])}
              >
                <span className="text-lg">
                  The following Players weren&apos;t eligible for task type{' '}
                  {playerType}:
                </span>
                <br />
                <ul>
                  {submissionErrors.map((player) => (
                    <li key={player.pid} className="font-mont">
                      Name: {player.name} | Username: {player.username} | User
                      ID: {player.uid}
                    </li>
                  ))}
                </ul>
              </DismissableAlert>

              <Divider className="my-4" />

              <div className="my-4">
                <MemoizedTPESubmissionTable />
              </div>

              {parsedSubmissionData.hasDuplicates && (
                <div className="my-4 text-center">
                  <Text color="red">
                    There are duplicate records that need to be resolved before
                    you can continue.
                  </Text>
                </div>
              )}

              <div className="my-4 flex items-center">
                <Button
                  colorScheme="green"
                  isLoading={isSubmitting}
                  isDisabled={
                    !pendingUpdates.length ||
                    !taskDescription.length ||
                    parsedSubmissionData.hasDuplicates ||
                    (typeof taskThread === 'string' && taskThread !== ''
                      ? !taskThread?.startsWith(
                          'https://simulationhockey.com/showthread.php?tid=',
                        )
                      : false)
                  }
                  type="button"
                  className="w-full"
                  onClick={() => setIsVerificationModalOpen(true)}
                >
                  Submit
                </Button>
              </div>
              <VerificationModal
                isOpen={isVerificationModalOpen}
                isSubmitting={isSubmitting}
                pendingUpdates={pendingUpdates}
                closeModal={closeModal}
                handleSubmit={handleSubmit}
              />

              <Divider />
              <SubHeading className="mt-4 mb-2">Eligible Players</SubHeading>
              <PlayerTable
                data={data}
                linkTarget="_blank"
                isLoading={isLoading}
                actionConfig={{
                  action: 'Add',
                  callback: addSelectedPlayer,
                  disabledIDs: pendingUpdateIDs,
                }}
              />
            </TabPanel>
            <TabPanel>
              <AllTPEEvents />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </RoleGuard>
    </PageWrapper>
  );
};
