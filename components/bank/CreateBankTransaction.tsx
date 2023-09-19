import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  FormErrorMessage,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { CSVUpload } from 'components/common/CSVUpload';
import { DismissableAlert } from 'components/common/DismissableAlert';
import { UsernameSearch } from 'components/common/UsernameSearch';
import { FormikHelpers, useFormik } from 'formik';
import { useUsers } from 'hooks/useUsers';
import { BANK_TRANSACTION_TYPES } from 'lib/constants';
import _ from 'lodash';
import React, { useCallback, useRef, useState } from 'react';
import { BankTransactionTypes, UserInfo } from 'typings';
import * as Yup from 'yup';

import { CompleteBankTransaction } from './CompleteBankTransaction';

interface TransactionRecord extends UserInfo {
  amount: number;
  description?: string;
}

export type TransactionData = {
  type: BankTransactionTypes;
  groupName: string;
  users: TransactionRecord[];
};

type TransactionUpload = {
  username: string;
  amount: number;
  description?: string;
};

const validationSchema = Yup.object({}).shape({
  type: Yup.string()
    .required('Type is required')
    .oneOf([...BANK_TRANSACTION_TYPES], 'Invalid type')
    .default('other'),
  groupName: Yup.string()
    .required('Title is required')
    .min(5, 'Title must be at least 5 characters')
    .max(80, 'Title must be at most 80 characters'),
  users: Yup.array()
    .of(
      Yup.object({}).shape({
        userID: Yup.number(),
        username: Yup.string(),
        amount: Yup.number().nullable(),
        description: Yup.string().nullable(),
      }),
    )
    .min(1, 'At least one user must be added'),
});

export type TransactionFormValidation = Yup.InferType<typeof validationSchema>;

const parseArrays = (array1: TransactionUpload[], array2: UserInfo[]) => {
  const validUsers = array1
    .map((item1) => {
      const matchingUser = array2.find(
        (item2) => item2.username === item1.username,
      );
      if (matchingUser) {
        return { ...item1, userID: matchingUser.userID };
      }
      return null;
    })
    .filter(Boolean)
    .map((trans) => ({
      ...trans,
      amount: String(trans?.amount).replace(/[$,]/g, ''),
    }));

  const errorUsers = _.differenceBy(array1, validUsers, 'username').map(
    (user) => user.username,
  );

  return { validUsers, errorUsers };
};

const CreateBankTransaction = ({
  handleCancel,
}: {
  handleCancel: () => void;
}) => {
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const { users } = useUsers();

  const initialValues: TransactionFormValidation = {
    type: '',
    groupName: '',
    users: [],
  };

  const [transactionData, setTransactionData] = useState<
    TransactionFormValidation | undefined
  >();

  const [erroredUsers, setErroredUsers] = useState<string[]>([]);

  const handleCSVUpload = useCallback(
    (
      setFieldValues: FormikHelpers<TransactionFormValidation>['setFieldValue'],
      csvUsers: TransactionUpload[],
    ) => {
      const { validUsers, errorUsers } = parseArrays(csvUsers, users);

      if (errorUsers.length) {
        setErroredUsers(errorUsers);
      }

      setFieldValues('users', validUsers);
    },
    [users],
  );

  const handleUserChange = useCallback(
    (
      setFieldValue: FormikHelpers<TransactionFormValidation>['setFieldValue'],
      users: TransactionFormValidation['users'],
      type: string | undefined,
      newUser: UserInfo,
    ) => {
      if (type === 'transfer') {
        setFieldValue('users', [newUser]);
        return;
      }

      if (!users?.some((u) => u.userID === newUser.userID))
        setFieldValue('users', [...(users ?? []), newUser]);
    },
    [],
  );

  const handleCloseModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTransactionData(undefined);
  }, []);

  const groupNameRef = useRef<HTMLInputElement>(null);

  const {
    errors,
    touched,
    values,
    isValid,
    setFieldValue,
    setFieldTouched,
    handleSubmit,
    resetForm,
  } = useFormik<TransactionFormValidation>({
    validateOnBlur: true,
    validateOnChange: true,
    validateOnMount: true,
    enableReinitialize: true,
    initialValues: initialValues,
    onSubmit: (values) => {
      setTransactionData(values);
      setIsDetailModalOpen(true);
    },
    validationSchema,
  });

  const handleResetForm = useCallback(() => {
    resetForm();
    setFieldTouched('type', false, false);
    setFieldTouched('groupName', false, false);
    if (groupNameRef.current) groupNameRef.current.value = '';
    setFieldTouched('users', false, false);
  }, [resetForm, setFieldTouched]);

  return (
    <div className="mb-4 w-full">
      <form className="flex-col" onSubmit={handleSubmit}>
        <div className="mb-4 flex w-full flex-wrap space-y-4 sm:space-x-4">
          <div className="w-full flex-col space-y-4 sm:w-1/2">
            <FormControl
              id="type"
              isInvalid={Boolean(
                (errors.type && touched.type) ||
                  (touched.type && values.type === ''),
              )}
            >
              <FormLabel>Type</FormLabel>
              <Select
                as="select"
                name="type"
                value={values.type}
                placeholder="Select Type"
                onBlur={() => setFieldTouched('type')}
                onChange={(e) => {
                  if (e.target.value === 'transfer') {
                    setFieldValue('users', []);
                  }
                  setFieldValue('type', e.target.value);
                }}
              >
                {BANK_TRANSACTION_TYPES.filter(
                  (type) =>
                    type !== 'cards' &&
                    type !== 'training' &&
                    type !== 'seasonal coaching' &&
                    type !== 'change',
                ).map((type) => (
                  <option key={type} value={type}>
                    {_.startCase(type)}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>
                {errors.type ?? 'Type is required.'}
              </FormErrorMessage>
            </FormControl>
            <FormControl
              id="groupName"
              isInvalid={Boolean(errors.groupName && touched.groupName)}
            >
              <FormLabel>Title</FormLabel>
              <Input
                ref={groupNameRef}
                type="text"
                name="groupName"
                onBlur={() => setFieldTouched('groupName')}
                onChange={(e) => setFieldValue('groupName', e.target.value)}
              />
              <FormErrorMessage>{errors.groupName}</FormErrorMessage>
            </FormControl>
            <FormLabel>User</FormLabel>
            <FormControl
              isInvalid={Boolean(
                errors.users && values.type && values.groupName,
              )}
            >
              <UsernameSearch
                handleClick={(newUser) =>
                  handleUserChange(
                    setFieldValue,
                    values.users,
                    values.type,
                    newUser,
                  )
                }
                clearOnClick={values.type !== 'transfer'}
              />
              {values.type !== 'transfer' && (
                <div className="mt-4">
                  <CSVUpload<TransactionUpload>
                    expectedHeaders={['username', 'amount']}
                    optionalHeaders={['description']}
                    onDataUpload={(value) =>
                      handleCSVUpload(setFieldValue, value)
                    }
                  />
                </div>
              )}
              <FormErrorMessage>
                {errors.users
                  ? JSON.stringify(errors.users).replaceAll('"', '')
                  : ''}
              </FormErrorMessage>
            </FormControl>
          </div>

          <div className="flex-grow flex-col border-x-2 border-b-2 border-solid">
            <div className="flex max-h-fit w-full bg-grey900 p-2 text-lg text-grey100">
              User List
            </div>
            <div className="p-2">
              {values?.users?.map((user) => (
                <Tag
                  size="sm"
                  key={user.userID}
                  borderRadius="full"
                  variant="solid"
                  colorScheme="blackAlpha"
                  className="mr-2"
                >
                  <TagLabel>{user.username}</TagLabel>
                  <TagCloseButton
                    onClick={() =>
                      setFieldValue(
                        'users',
                        values?.users?.filter((u) => u.userID !== user.userID),
                      )
                    }
                  />
                </Tag>
              ))}
            </div>
          </div>
        </div>
        <DismissableAlert
          variant="subtle"
          status="error"
          className="mb-4"
          title="Users not found"
          isOpen={erroredUsers.length > 0}
          onClose={() => setErroredUsers([])}
        >
          <span className="text-lg">The following Users were not found:</span>
          <br />
          <UnorderedList>
            {erroredUsers.map((username) => (
              <ListItem key={username} className="font-mont">
                {username}
              </ListItem>
            ))}
          </UnorderedList>
        </DismissableAlert>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2">
          <Button colorScheme="gray" type="button" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            colorScheme="orange"
            type="submit"
            isDisabled={
              !isValid || values?.users?.length === 0 || !values?.type
            }
          >
            Enter Transaction Details
          </Button>
        </div>
        {transactionData && (
          <CompleteBankTransaction
            transactionData={transactionData as TransactionData}
            isOpen={isDetailModalOpen}
            handleCloseModal={handleCloseModal}
            handleResetForm={handleResetForm}
          />
        )}
      </form>
    </div>
  );
};

export default CreateBankTransaction;
