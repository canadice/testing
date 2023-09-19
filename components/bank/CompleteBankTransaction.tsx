import { AddIcon, ArrowBackIcon, CloseIcon } from '@chakra-ui/icons';
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UsernameSearch } from '../../components/common/UsernameSearch';
import { useSession } from '../../contexts/AuthContext';
import { ToastContext } from '../../contexts/ToastContext';
import { useCurrentPlayer } from '../../hooks/useCurrentPlayer';
import _ from 'lodash';
import { useCallback, useContext, useEffect, useState } from 'react';
import { BankTransaction, BankTransactionTypes, UserInfo } from '../../typings';
import { formatCurrency } from '../../utils/formatCurrency';
import { mutate } from '../../utils/query';

import { TransactionData } from './CreateBankTransaction';

type ShellBankTransaction = Pick<
  BankTransaction,
  'uid' | 'type' | 'description' | 'groupName'
> & { username: string; tempId: string; amount: string };

const parseAmount = (value: string) => {
  return value.startsWith('0') && value.includes('-')
    ? '-'
    : value.replace(/[^0-9-]/g, '');
};

// 
export const CompleteBankTransaction = ({
  // The transaction data provided
  transactionData,
  // If the modal is open
  isOpen,
  // Handles closing the modal
  handleCloseModal,
  handleResetForm,
}: {
  transactionData: TransactionData;
  isOpen: boolean;
  handleCloseModal: () => void;
  handleResetForm: () => void;
}) => {
  const { player, loading } = useCurrentPlayer();
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const queryClient = useQueryClient();

  const [transactions, setTransactions] = useState<ShellBankTransaction[]>(
    transactionData.users.map((transaction) => ({
      tempId: _.uniqueId(),
      uid: transaction.userID,
      type: transactionData.type as BankTransactionTypes,
      groupName: transactionData.groupName,
      amount: transaction.amount ? `${transaction.amount}` : '0',
      description: transaction.description,
      username: transaction.username,
    })),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const createTransaction = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/bank/transactions/create', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    createTransaction.mutate(
      {
        transactions:
          transactionData.type !== 'transfer'
            ? transactions
            : [...transactions, deduction],
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: 'Could not submit bank transaction. Please try again.',
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: 'Transaction successfully created.',
            status: 'success',
          });
          queryClient.invalidateQueries({
            queryKey: ['bankTransactionSummaries'],
          });
          handleCloseModal();
          handleResetForm();
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  const [deduction, setDeduction] = useState<
    ShellBankTransaction | undefined
  >();

  useEffect(() => {
    if (transactionData.type === 'transfer' && player) {
      setDeduction({
        tempId: 'deduction',
        uid: player.uid,
        type: 'transfer',
        description: 'Deduction',
        amount:
          `-${transactions
            .map((trans) => trans.amount)
            .reduce((a, b) => {
              return a + Number(b);
            }, 0)}` ?? '0',
        groupName: transactionData.groupName,
        username: player.username,
      });
    }
  }, [
    transactionData.type,
    transactionData.groupName,
    loading,
    player,
    transactions,
  ]);

  const handleAmountChange = useCallback((value: string, id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.tempId === id) {
          return { ...t, amount: parseAmount(value) };
        } else {
          return t;
        }
      }),
    );
  }, []);

  const handleDescriptionChange = useCallback((value: string, id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.tempId === id) {
          return { ...t, description: value };
        } else {
          return t;
        }
      }),
    );
  }, []);

  const handleAddUser = useCallback(
    (user: UserInfo) => {
      setTransactions((prev) => [
        ...prev,
        {
          tempId: _.uniqueId(),
          uid: user.userID,
          type: transactionData.type as BankTransactionTypes,
          groupName: transactionData.groupName,
          amount: '0',
          description: '',
          username: user.username,
        },
      ]);

      setIsAddingUser(false);
    },
    [transactionData.groupName, transactionData.type],
  );

  const [isReviewing, setIsReviewing] = useState(false);

  const deleteTransaction = useCallback(
    (id: string) => {
      if (transactions.length === 1) handleCloseModal();
      setTransactions((prev) => prev.filter((trans) => trans.tempId !== id));
    },
    [handleCloseModal, transactions.length],
  );

  return (
    <Modal
      size="3xl"
      isOpen={isOpen}
      onClose={handleCloseModal}
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Payment Details - {_.startCase(transactionData.type)}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div className="mb-2 text-lg font-bold">
            {transactionData.groupName}
          </div>
          {isReviewing ? (
            <TableContainer>
              <Table variant="striped" width="100%">
                <Thead>
                  <Tr>
                    <Th>Username</Th>
                    <Th isNumeric>Amount</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {deduction && (
                    <Tr>
                      <Td> {deduction.username} </Td>
                      <Td isNumeric textColor="red">
                        {formatCurrency(Number(deduction.amount))}
                      </Td>
                    </Tr>
                  )}
                  {transactions.map((transaction) => (
                    <Tr key={transaction.tempId}>
                      <Td> {transaction.username} </Td>
                      <Td isNumeric>
                        {formatCurrency(Number(transaction.amount))}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          ) : (
            <div className="flex-col space-y-4">
              {deduction && (
                <FormControl
                  isInvalid={
                    transactionData.type === 'transfer' &&
                    Number(deduction?.amount) + (player?.bankBalance ?? 0) < 0
                  }
                >
                  <FormLabel>{deduction.username}</FormLabel>
                  <Input
                    className="font-mont text-red200"
                    isDisabled
                    readOnly
                    value={formatCurrency(Number(deduction.amount))}
                  ></Input>
                  <FormErrorMessage>
                    You don&apos;t have enough available funds for this
                    transfer.
                  </FormErrorMessage>
                </FormControl>
              )}
              {transactions.map((transaction) => (
                <div
                  key={transaction.tempId}
                  className="flex min-h-fit flex-nowrap items-stretch space-x-2"
                >
                  <div className="flex w-full flex-col space-y-2">
                    <FormControl
                      isRequired
                      isInvalid={transaction.amount === undefined}
                    >
                      <FormLabel>{transaction.username}</FormLabel>
                      <div className="flex flex-nowrap space-x-2">
                        <NumberInput
                          className="flex-grow font-mont"
                          precision={0}
                          min={
                            transaction.type === 'transfer' ? 0 : -100_000_000
                          }
                          max={100_000_000}
                          clampValueOnBlur
                          value={
                            isNaN(Number(transaction.amount))
                              ? transaction.amount
                              : formatCurrency(Number(transaction.amount))
                          }
                          onChange={(value) =>
                            handleAmountChange(value, transaction.tempId)
                          }
                          onKeyPress={(event) => {
                            const charCode = event.which || event.keyCode;
                            // Allow only numeric, minus, and backspace characters
                            if (
                              (charCode < 48 || charCode > 57) &&
                              charCode !== 45 && // Minus sign
                              charCode !== 8
                            ) {
                              event.preventDefault();
                            }
                          }}
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </div>
                      <FormErrorMessage>
                        Please enter a valid value.
                      </FormErrorMessage>
                    </FormControl>
                    <FormControl>
                      <Input
                        placeholder="Description..."
                        type="text"
                        max={500}
                        defaultValue={transaction.description}
                        onChange={(e) =>
                          handleDescriptionChange(
                            e.target.value,
                            transaction.tempId,
                          )
                        }
                      ></Input>
                    </FormControl>
                  </div>
                  <IconButton
                    height="fit"
                    onClick={() => deleteTransaction(transaction.tempId)}
                    variant="ghost"
                    colorScheme="red"
                    icon={<CloseIcon />}
                    aria-label={`Delete transaction for ${transaction.username}`}
                  />
                </div>
              ))}
              {transactionData.type !== 'transfer' &&
                (isAddingUser ? (
                  <UsernameSearch
                    clearOnClick
                    handleClick={(user) => handleAddUser(user)}
                  />
                ) : (
                  <Button
                    width="100%"
                    colorScheme="blue"
                    aria-label="Add another user"
                    leftIcon={<AddIcon />}
                    onClick={() => setIsAddingUser(true)}
                  >
                    Add User
                  </Button>
                ))}
            </div>
          )}
        </ModalBody>
        <ModalFooter className="bottom-0 flex items-center p-2">
          {isReviewing ? (
            <>
              <Button
                leftIcon={<ArrowBackIcon />}
                colorScheme="gray"
                type="button"
                className="mr-2 w-1/2"
                onClick={() => setIsReviewing(false)}
              >
                Go Back
              </Button>

              <Button
                colorScheme="orange"
                width="100%"
                isDisabled={transactions.some(
                  (trans) => !trans.amount || trans.amount === '0',
                )}
                isLoading={isSubmitting}
                onClick={handleSubmit}
              >
                Submit Transaction
              </Button>
            </>
          ) : (
            <Button
              colorScheme="orange"
              width="100%"
              isDisabled={
                transactions.some(
                  (trans) => !trans.amount || trans.amount === '0',
                ) ||
                (transactionData.type === 'transfer' &&
                  Number(deduction?.amount) + (player?.bankBalance ?? 0) < 0)
              }
              onClick={() => setIsReviewing(true)}
            >
              {transactions.some(
                (trans) => !trans.amount || trans.amount === '0',
              )
                ? 'Enter Payment Details'
                : 'Review Payment Details'}
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
