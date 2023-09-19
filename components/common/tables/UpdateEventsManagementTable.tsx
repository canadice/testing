import { CheckIcon, CloseIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Progress,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { RoleGuard } from 'components/auth/RoleGuard';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useSeason } from 'hooks/useSeason';
import { startCase } from 'lodash';
import { useCallback, useMemo, useState, useContext, useEffect } from 'react';
import { UpdateEvents } from 'typings';
import { formatDateTime } from 'utils/formatDateTime';
import { mutate } from 'utils/query';

import { Link } from '../Link';

import { simpleGlobalFilterFn } from './shared';
import { Table } from './Table';
import { UPDATE_EVENTS_TABLE } from './tableBehavioralFlags';
import { TableHeader } from './TableHeader';

const columnHelper = createColumnHelper<UpdateEvents>();

type ProcessingTransactions = {
  approvals: number[];
  denials: number[];
};

export const UpdateEventsManagementTable = ({
  data,
  isLoading,
}: {
  data: Array<UpdateEvents>;
  isLoading: boolean;
}) => {
  const [currentlyProcessing, setCurrentlyProcessing] =
    useState<ProcessingTransactions>({ approvals: [], denials: [] });
  const queryClient = useQueryClient();
  const { season } = useSeason();
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const [isSeasonModalOpen, setIsSeasonModalOpen] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(season + 1);
  const [playerApprovalEventID, setPlayerApprovalEventID] = useState<
    number | undefined
  >(undefined);

  useEffect(() => setSelectedSeason(season + 1), [season]);

  const handleCloseModal = useCallback(() => {
    setPlayerApprovalEventID(undefined);
    setIsSeasonModalOpen(false);
  }, []);

  const handleOpenModal = useCallback((eventID: number) => {
    setPlayerApprovalEventID(eventID);
    setIsSeasonModalOpen(true);
  }, []);

  const denyChange = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/deny', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const approveChange = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/player/change/approve', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const submitChange = useCallback(
    async (eventID: number, type: 'Approve' | 'Deny') => {
      const changeMutation = type === 'Approve' ? approveChange : denyChange;

      changeMutation.mutate(
        {
          eventID,
          season: selectedSeason,
        },
        {
          onError: () => {
            addToast({
              title: `Player change ${
                type === 'Approve' ? 'approval' : 'denial'
              } failed`,
              description: `We were unable to process the ${
                type === 'Approve' ? 'approval' : 'denial'
              } for ${eventID}. Please try again.`,
              status: 'error',
            });
          },
          onSuccess: () => {
            setIsSeasonModalOpen(false);
            setPlayerApprovalEventID(undefined);
            addToast({
              title: `Player change ${
                type === 'Approve' ? 'approval' : 'denial'
              } confirmed`,
              description: `${
                type === 'Approve' ? 'Approval' : 'Denial'
              } for ${eventID} successfully processed.`,
              status: 'success',
            });
          },
          onSettled: () => {
            if (type === 'Approve') {
              setCurrentlyProcessing((prev) => ({
                approvals: prev.approvals.filter(
                  (approval) => approval !== eventID,
                ),
                denials: prev.denials,
              }));
            } else {
              setCurrentlyProcessing((prev) => ({
                approvals: prev.approvals,
                denials: prev.denials.filter((denial) => denial !== eventID),
              }));
            }
            queryClient.invalidateQueries({ queryKey: ['approvals'] });
          },
        },
      );
    },

    [addToast, approveChange, denyChange, queryClient, selectedSeason],
  );

  const onClickDeny = useCallback(
    (eventID: number) => {
      setCurrentlyProcessing((prev) => ({
        approvals: prev.approvals,
        denials: [...prev.denials, eventID],
      }));
      submitChange(eventID, 'Deny');
    },
    [submitChange],
  );

  const onClickApprove = useCallback(
    (eventID: number) => {
      setCurrentlyProcessing((prev) => ({
        approvals: [...prev.approvals, eventID],
        denials: prev.denials,
      }));
      submitChange(eventID, 'Approve');
    },
    [submitChange],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('playerUpdateID', {
        header: () => <TableHeader title="Player ID">Player ID</TableHeader>,
        cell: (props) => {
          const cellValue = props.getValue();
          return (
            <Link
              className="!hover:no-underline hover:text-blue600"
              href={{
                pathname: '/player/[id]',
                query: {
                  id: cellValue,
                },
              }}
              target="_blank"
            >
              <div className="space-x-2">
                <span className="ml-2">{cellValue}</span>
                <ExternalLinkIcon className="ml-2" />
              </div>
            </Link>
          );
        },
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('eventID', {
        header: () => <TableHeader title="Event ID">Event ID</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('attributeChanged', {
        header: () => (
          <TableHeader title="Type/Attribute">Type/Attribute</TableHeader>
        ),
        cell: (props) => startCase(props.getValue()),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('oldValue', {
        header: () => (
          <TableHeader title="Previous Value">Previous Value</TableHeader>
        ),
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('newValue', {
        header: () => <TableHeader title="New Value">New Value</TableHeader>,
        enableGlobalFilter: true,
      }),
      columnHelper.accessor('eventDate', {
        header: () => <TableHeader title="Changed On">Changed On</TableHeader>,
        enableGlobalFilter: true,
        cell: (props) => formatDateTime(props.getValue()),
      }),
      columnHelper.accessor('status', {
        header: () => <TableHeader title="Status">Status</TableHeader>,
        enableGlobalFilter: true,
        cell: (props) => startCase(props.getValue()),
      }),
      columnHelper.accessor(
        ({ eventID, attributeChanged }) => [eventID, attributeChanged],
        {
          header: 'Actions',
          id: 'actions',
          cell: (props) => {
            const cellValue = props.getValue();
            const cellEventID = Number(cellValue[0]);

            return (
              <RoleGuard
                userRoles={
                  props.row.original.attributeChanged === 'status'
                    ? [
                        'SMJHL_INTERN',
                        'SMJHL_HO',
                        'SMJHL_COMMISSIONER',
                        'SHL_COMMISSIONER',
                      ]
                    : ['SHL_HO', 'SMJHL_COMMISSIONER', 'SHL_COMMISSIONER']
                }
              >
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<CloseIcon />}
                    colorScheme="red"
                    onClick={() => onClickDeny(cellEventID)}
                    isDisabled={currentlyProcessing.approvals.includes(
                      cellEventID,
                    )}
                    isLoading={currentlyProcessing.denials.includes(
                      cellEventID,
                    )}
                  >
                    Deny
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    rightIcon={<CheckIcon />}
                    colorScheme="green"
                    onClick={() =>
                      cellValue[1] === 'status'
                        ? handleOpenModal(cellEventID)
                        : onClickApprove(cellEventID)
                    }
                    isDisabled={currentlyProcessing.denials.includes(
                      cellEventID,
                    )}
                    isLoading={currentlyProcessing.approvals.includes(
                      cellEventID,
                    )}
                  >
                    Approve
                  </Button>
                </div>
              </RoleGuard>
            );
          },
          enableSorting: false,
        },
      ),
    ],
    [
      currentlyProcessing.approvals,
      currentlyProcessing.denials,
      handleOpenModal,
      onClickApprove,
      onClickDeny,
    ],
  );

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableGlobalFilter: true,
    globalFilterFn: simpleGlobalFilterFn,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <>
      <Table<UpdateEvents>
        table={table}
        tableBehavioralFlags={UPDATE_EVENTS_TABLE}
      />
      {isLoading && <Progress size="xs" isIndeterminate />}
      <Modal
        size={'sm'}
        isOpen={isSeasonModalOpen}
        onClose={handleCloseModal}
        isCentered
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Assign Draft Season</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select
              placeholder="Select season"
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(parseInt(e.target.value));
              }}
            >
              <option value={season + 1}>S{season + 1}</option>
              <option value={season + 2}>S{season + 2}</option>
            </Select>
          </ModalBody>
          <ModalFooter className="bottom-0 flex items-center p-2">
            <Button
              colorScheme="gray"
              type="button"
              className="mr-2 w-1/2"
              onClick={() => setIsSeasonModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              type="button"
              className="w-1/2"
              onClick={() => onClickApprove(playerApprovalEventID ?? -1)}
              isDisabled={currentlyProcessing.denials.includes(
                playerApprovalEventID ?? -1,
              )}
              isLoading={currentlyProcessing.approvals.includes(
                playerApprovalEventID ?? -1,
              )}
            >
              Approve Player
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
