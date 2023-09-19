import { Checkbox, Tooltip } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { AccountHeader } from 'components/bank/AccountHeader';
import { PageWrapper } from 'components/common/PageWrapper';
import { SubHeading } from 'components/common/SubHeading';
import { BankTransactionSummaryTable } from 'components/common/tables/BankTransactionSummaryTable';
import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { BankTransactionSummary } from 'typings';
import { query } from 'utils/query';

export default ({ userID }: { userID: number }) => {
  const [showCards, setShowCards] = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  const { data = [], isLoading } = useQuery<BankTransactionSummary[]>({
    queryKey: ['userTransactionSummaries', showCards, showActivities, userID],
    queryFn: () =>
      query(
        `api/v1/bank/transactions/summary?payee=${userID}${
          showCards ? '&showCards=true' : ''
        }${showActivities ? '&showActivities=true' : ''}`,
      ),
  });

  return (
    <PageWrapper className="flex flex-col">
      <div className="mb-4">
        <AccountHeader userID={userID} />
      </div>
      <SubHeading className="mb-2">
        <div className="flex items-center justify-between">
          <span className="font-bold">Transactions</span>
          <div className="flex items-center justify-end space-x-4">
            <Tooltip
              label="Show player activities like Training, Coaching or Redistribution"
              shouldWrapChildren
            >
              <Checkbox
                isChecked={showActivities}
                onChange={(e) => setShowActivities(e.target.checked)}
                className="text-sm font-semibold sm:text-base"
              >
                Show Activities
              </Checkbox>
            </Tooltip>

            <Tooltip label="Show trading card purchases">
              <Checkbox
                isChecked={showCards}
                onChange={(e) => setShowCards(e.target.checked)}
                className="text-sm font-semibold sm:text-base"
              >
                Show Cards
              </Checkbox>
            </Tooltip>
          </div>
        </div>
      </SubHeading>
      <BankTransactionSummaryTable data={data} isLoading={isLoading} />
    </PageWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const { uid } = query;

  return {
    props: {
      userID: uid,
    },
  };
};
