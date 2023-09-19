import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Select,
  ModalFooter,
  Button,
  FormLabel,
  Checkbox,
  Input,
  RadioGroup,
  Stack,
  Radio,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { UsernameSearch } from 'components/common/UsernameSearch';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { BANK_TRANSACTION_TYPES } from 'lib/constants';
import { startCase } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BankTransactionTypes, UserInfo } from 'typings';

function parseQueryString(queryString: string) {
  const params = new URLSearchParams(queryString);

  const typeValues = params.getAll('type');
  const statusValues = params.getAll('status');
  const submitDate = params.get('submitDate');
  const approvedDate = params.get('approvedDate');
  const league = params.get('league');
  const teamID = params.get('teamID');

  return {
    typeValues,
    statusValues,
    submitDate,
    approvedDate,
    league,
    teamID,
  };
}

export const TransactionQueryBuilder = ({
  isOpen,
  handleClose,
  applyFilter,
  filters,
}: {
  isOpen: boolean;
  handleClose: () => void;
  applyFilter: (filter: string) => void;
  filters: string;
}) => {
  const [typeArray, setTypeArray] = useState<BankTransactionTypes[]>([]);
  const [statusArray, setStatusArray] = useState<string[]>([]);
  const [transactionDate, setTransactionDate] = useState<string | undefined>();
  const [transactionDateType, setTransactionDateType] = useState<
    string | undefined
  >();
  const [specificUser, setSpecificUser] = useState<UserInfo | undefined>();
  const [specificUserType, setSpecificUserType] = useState<
    string | undefined
  >();
  const [currentLeague, setCurrentLeague] = useState<string | undefined>();
  const [currentTeam, setCurrentTeam] = useState<number | undefined>();

  const [initialState, setInitialState] = useState<
    | {
        typeArray: typeof typeArray;
        statusArray: typeof statusArray;
        transactionDate: typeof transactionDate;
        transactionDateType: typeof transactionDateType;
        specificUser: typeof specificUser;
        specificUserType: typeof specificUserType;
        currentLeague: typeof currentLeague;
        currentTeam: typeof currentTeam;
      }
    | undefined
  >();

  const { shlTeams, smjhlTeams, loading } = useTeamInfo();

  const leagueTeams = useMemo(
    () => (currentLeague === 'SHL' ? shlTeams : smjhlTeams),
    [currentLeague, shlTeams, smjhlTeams],
  );

  const handleApply = useCallback(() => {
    const typeQuery = typeArray.length
      ? `&type=${typeArray.join('&type=')}`
      : '';
    const statusQuery = statusArray.length
      ? `&status=${statusArray.join('&status=')}`
      : '';
    const dateQuery = transactionDate
      ? `&${transactionDateType ?? 'date'}=${transactionDate}`
      : '';
    const userQuery = specificUser
      ? `&${specificUserType ?? 'user'}=${specificUser.userID}`
      : '';
    const leagueQuery = currentLeague ? `&league=${currentLeague}` : '';
    const teamQuery = currentTeam ? `&teamID=${currentTeam}` : '';

    applyFilter(
      `?${[typeQuery, statusQuery, dateQuery, userQuery, leagueQuery, teamQuery]
        .join('')
        .slice(1)}`,
    );
    handleClose();
  }, [
    applyFilter,
    currentLeague,
    currentTeam,
    handleClose,
    specificUser,
    specificUserType,
    statusArray,
    transactionDate,
    transactionDateType,
    typeArray,
  ]);

  useEffect(() => {
    if (isOpen) {
      setInitialState({
        typeArray,
        statusArray,
        transactionDate,
        transactionDateType,
        specificUser,
        specificUserType,
        currentLeague,
        currentTeam,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!filters.length) {
      setTypeArray([]);
      setStatusArray([]);
      setTransactionDate(undefined);
      setTransactionDateType(undefined);
      setSpecificUser(undefined);
      setSpecificUserType(undefined);
      setCurrentLeague(undefined);
      setCurrentTeam(undefined);
      setInitialState(undefined);
    } else {
      const {
        typeValues,
        statusValues,
        submitDate,
        approvedDate,
        league,
        teamID,
      } = parseQueryString(filters);
      setTypeArray(typeValues as BankTransactionTypes[]);
      setStatusArray(statusValues);
      setTransactionDate(submitDate ?? approvedDate ?? undefined);
      setTransactionDateType(submitDate ? 'submitDate' : 'approvedDate');
      setSpecificUser(undefined);
      setSpecificUserType(undefined);
      setCurrentLeague(league ? league : undefined);
      setCurrentTeam(teamID ? Number(teamID) : undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleCancel = useCallback(() => {
    setTypeArray(initialState?.typeArray ?? []);
    setStatusArray(initialState?.statusArray ?? []);
    setTransactionDate(initialState?.transactionDate);
    setTransactionDateType(initialState?.transactionDateType);
    setSpecificUser(initialState?.specificUser);
    setSpecificUserType(initialState?.specificUserType);
    setCurrentLeague(initialState?.currentLeague);
    setCurrentTeam(initialState?.currentTeam);
    handleClose();
  }, [handleClose, initialState]);

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={handleCancel}
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Transaction Filters</ModalHeader>
        <ModalCloseButton />
        <ModalBody className="space-y-4">
          <div>
            <FormLabel>Transaction Type</FormLabel>
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] gap-2">
              {BANK_TRANSACTION_TYPES.filter((type) => type !== 'cards').map(
                (type) => (
                  <Checkbox
                    className="mr-4"
                    key={type}
                    isChecked={typeArray.includes(type)}
                    onChange={(e) =>
                      setTypeArray((prev) =>
                        e.target.checked
                          ? [...prev, type]
                          : prev.filter((t) => t !== type),
                      )
                    }
                  >
                    {startCase(
                      type === 'seasonal coaching' ? 'Coaching' : type,
                    )}
                  </Checkbox>
                ),
              )}
            </div>
          </div>
          <Divider />
          <div>
            <FormLabel>Status</FormLabel>
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] gap-2">
              {['completed', 'denied', 'pending'].map((status) => (
                <Checkbox
                  className="mr-4"
                  key={status}
                  isChecked={statusArray.includes(status)}
                  onChange={(e) =>
                    setStatusArray((prev) =>
                      e.target.checked
                        ? [...prev, status]
                        : prev.filter((t) => t !== status),
                    )
                  }
                >
                  <Badge
                    colorScheme={
                      status === 'completed'
                        ? 'green'
                        : status === 'denied'
                        ? 'red'
                        : 'blue'
                    }
                  >
                    {startCase(status)}
                  </Badge>
                </Checkbox>
              ))}
            </div>
          </div>
          <Divider />
          <div>
            <FormLabel>Date</FormLabel>
            <Input
              defaultValue={transactionDate}
              type="date"
              onChange={(e) => setTransactionDate(e.target.value)}
            />
            <RadioGroup
              onChange={setTransactionDateType}
              value={transactionDateType}
              isDisabled={!transactionDate}
              className="mt-2"
            >
              <Stack direction="row">
                <Radio value="submitDate">Requested</Radio>
                <Radio value="approvedDate">Reviewed</Radio>
              </Stack>
            </RadioGroup>
          </div>
          <Divider />
          <div>
            <FormLabel>User</FormLabel>
            <UsernameSearch handleClick={setSpecificUser} />
            <RadioGroup
              onChange={setSpecificUserType}
              value={specificUserType}
              isDisabled={!specificUser}
              className="mt-2"
            >
              <Stack direction="row">
                <Radio value="requester">Requester</Radio>
                <Radio value="reviewer">Reviewer</Radio>
                <Radio value="payee">Payee</Radio>
              </Stack>
            </RadioGroup>
          </div>
          <Divider />
          <div>
            <FormLabel>Team</FormLabel>
            <Select
              onChange={(e) => setCurrentLeague(e.target.value)}
              value={currentLeague}
              name="handedness"
              className="font-mont"
              placeholder="Select a League"
            >
              <option value="SHL">SHL</option>
              <option value="SMJHL">SMJHL</option>
            </Select>
            <Select
              defaultValue={currentTeam}
              isDisabled={loading || !currentLeague}
              className="mt-4"
              placeholder="Select a Team"
              onChange={(e) => setCurrentTeam(Number(e.currentTarget.value))}
            >
              {leagueTeams?.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </Select>
          </div>
        </ModalBody>
        <ModalFooter className="bottom-0 flex items-center p-2">
          <Button
            colorScheme="gray"
            type="button"
            className="mr-2 w-1/2"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            colorScheme="blue"
            type="button"
            className="w-1/2"
            onClick={handleApply}
          >
            Apply Filters
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
