import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { UserInfo } from 'typings';
import { query } from 'utils/query';

export const useUsers = (): {
  users: UserInfo[];
  loading: boolean;
} => {
  const { data: users = [], isLoading: loading } = useQuery<UserInfo[]>({
    queryKey: ['userInfo'],
    queryFn: () => query('/api/v1/userinfo'),
    staleTime: Infinity,
  });

  return useMemo(
    () => ({
      users,
      loading,
    }),
    [users, loading],
  );
};
