import { Badge } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BankTransactionSummary } from 'typings';

export const StatusBadge = ({
  status,
}: {
  status: BankTransactionSummary['status'];
}) => {
  const colorScheme = useMemo(() => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'denied':
      case 'reversed':
        return 'red';
      default:
        return 'blue';
    }
  }, [status]);

  return <Badge colorScheme={colorScheme}>{status}</Badge>;
};
