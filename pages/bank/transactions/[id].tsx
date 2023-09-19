import { Alert, AlertIcon, AlertTitle } from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Transaction } from 'components/bank/Transaction';
import { PageWrapper } from 'components/common/PageWrapper';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { GetServerSideProps } from 'next';
import { useContext, useState } from 'react';
import { BankTransaction } from 'typings';
import { mutate, query } from 'utils/query';

export default ({ transactionID }: { transactionID: number }) => {
  const { session } = useSession();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const { data = [], isLoading } = useQuery<BankTransaction[]>({
    queryKey: ['individualTransaction', transactionID],
    queryFn: () => query(`api/v1/bank/transactions?id=${transactionID}`),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const approve = useMutation<
    // TODO: type return type
    unknown,
    { message: string },
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/bank/transactions/approve', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const deny = useMutation<
    // TODO: type return type
    unknown,
    { message: string },
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/bank/transactions/deny', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const revert = useMutation<
    // TODO: type return type
    unknown,
    { message: string },
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/bank/transactions/reverse', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleSubmit = async (
    action: 'APPROVE' | 'DENY' | 'REVERT',
    transactionId?: number,
  ) => {
    setIsSubmitting(true);

    const transaction =
      action === 'APPROVE' ? approve : action === 'DENY' ? deny : revert;

    transaction.mutate(
      {
        recipient: 'INDIVIDUAL',
        id: transactionId ?? data[0].id,
      },
      {
        onError: ({ message }) => {
          addToast({
            title: `Error`,
            description: `Could not ${action.toLowerCase()} transaction. ${
              message ?? 'Please try again.'
            }`,
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: `Successfully ${
              action === 'APPROVE'
                ? 'approved'
                : action === 'DENY'
                ? 'denied'
                : 'reversed'
            } transaction.`,
            status: 'success',
          });
          queryClient.invalidateQueries({
            queryKey: ['individualTransaction'],
          });
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <PageWrapper
      title={
        data.length ? `Bank Transaction #${data[0].id}` : 'Bank Transaction'
      }
      className="flex flex-col"
      loading={isLoading}
    >
      {!data.length ? (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon />
          <AlertTitle>Transaction Not Found</AlertTitle>
        </Alert>
      ) : (
        <Transaction
          transactions={data}
          recipient="INDIVIDUAL"
          isSubmitting={isSubmitting}
          submit={handleSubmit}
        />
      )}
    </PageWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { id } = query;

  return {
    props: {
      transactionID: id,
    },
  };
};
