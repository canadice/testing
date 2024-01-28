import { CloseIcon } from '@chakra-ui/icons';
import {
  Button,
  Checkbox,
  Collapse,
  IconButton,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import CreateBankTransaction from 'components/bank/CreateBankTransaction';
import { TransactionQueryBuilder } from 'components/bank/TransactionQueryBuilder';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { SubHeading } from 'components/common/SubHeading';
import { BankTransactionSummaryTable } from 'components/common/tables/BankTransactionSummaryTable';
import { useSession } from 'contexts/AuthContext';
import { useCookie } from 'hooks/useCookie';
import config from 'lib/config';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';
import { BankTransactionSummary } from 'typings';
import { query } from 'utils/query';

const setSavedFilters = (filters: string) => {
  if (filters.length > 0) {
    const filtersParams = new URLSearchParams(filters);

    filtersParams.delete('requester');
    filtersParams.delete('reviewer');
    filtersParams.delete('payee');

    localStorage.setItem('bankFilters', `?${filtersParams.toString()}`);
  }
};

const getSavedFilters = () => {
  return localStorage.getItem('bankFilters');
};

export default () => {
  const { loggedIn } = useSession();
  const [userid] = useCookie(config.userIDCookieName);
  const router = useRouter();
  const [filters, setFilters] = useState<string>('');
  const [filtersLoaded, setFiltersLoaded] = useState(false);
  const [showCards, setShowCards] = useState(false);
  const [showActivities, setShowActivities] = useState(false);

  useEffect(() => {
    const savedFilters = getSavedFilters();

    if (savedFilters) {
      setFilters(savedFilters);
    }

    setFiltersLoaded(true);
  }, []);

  useEffect(() => {
    if (filtersLoaded) setSavedFilters(filters);
  }, [filters, filtersLoaded]);

  useEffect(() => {
    if (
      (filters.includes('seasonal coaching') || filters.includes('training')) &&
      !showActivities
    )
      setShowActivities(true);

    if (filters.includes('cards') && !showCards) setShowCards(true);
  }, [filters, showActivities, showCards]);

  const { data = [], isLoading } = useQuery<BankTransactionSummary[]>({
    queryKey: ['bankTransactionSummaries', filters, showCards, showActivities],
    queryFn: () =>
      query(
        `api/v1/bank/transactions/summary${filters}${
          showCards ? (filters ? '&showCards=true' : '?showCards=true') : ''
        }${
          showActivities
            ? filters || showCards
              ? '&showActivities=true'
              : '?showActivities=true'
            : ''
        }`,
      ),
    enabled: filtersLoaded,
  });

  const { isOpen, onOpen, onClose } = useDisclosure();

  const applyFilter = useCallback((value: string) => setFilters(value), []);

  const clearFilters = useCallback(() => {
    setFilters('');
    localStorage.removeItem('bankFilters');
  }, []);

  const [showTransaction, setShowTransaction] = useState(false);

  return (
    <PageWrapper title="Bank" className="flex flex-col">
      <PageHeading className="mb-4">Bank</PageHeading>
      {loggedIn && (
        <>
          <Collapse in={!showTransaction} animateOpacity>
            <div className="mb-4 grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2">
              <Button
                colorScheme="gray"
                variant="solid"
                onClick={() => router.push(`/bank/account/${userid}`)}
                isDisabled={!userid}
              >
                Your Account
              </Button>
              <Button
                colorScheme="gray"
                variant="solid"
                onClick={() => setShowTransaction(true)}
              >
                Submit Transaction
              </Button>
            </div>
          </Collapse>
          <Collapse in={showTransaction} animateOpacity>
            <CreateBankTransaction
              handleCancel={() => setShowTransaction(false)}
            />
          </Collapse>
        </>
      )}

      <SubHeading className="mb-2">
        <div className="flex items-center justify-between">
          <span className="font-bold">All Transactions</span>
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

            <Button className="text-grey900" onClick={onOpen} size="sm">
              Filters
            </Button>
            {filters.length > 0 && (
              <IconButton
                aria-label="Clear filters"
                colorScheme="red"
                size="sm"
                onClick={clearFilters}
                icon={<CloseIcon />}
              />
            )}
          </div>
        </div>
      </SubHeading>

      <BankTransactionSummaryTable data={data} isLoading={isLoading} />
      <TransactionQueryBuilder
        isOpen={isOpen}
        handleClose={onClose}
        applyFilter={applyFilter}
        filters={filters}
      />
    </PageWrapper>
  );
};
