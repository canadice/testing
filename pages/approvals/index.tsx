import { useQuery } from '@tanstack/react-query';
import { PermissionGuard } from 'components/auth/PermissionGuard';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { UpdateEventsManagementTable } from 'components/common/tables/UpdateEventsManagementTable';
import { useRedirectIfUnauthed } from 'hooks/useRedirectIfUnauthed';
import { UpdateEvents } from 'typings';
import { query } from 'utils/query';

export default () => {
  const { data, isLoading } = useQuery<UpdateEvents[]>({
    queryKey: ['approvals'],
    queryFn: () => query(`api/v1/updateevents?status=pending`, undefined),
  });

  useRedirectIfUnauthed('/', { roles: ['SHL_HO', 'SMJHL_HO', 'SMJHL_INTERN'] });

  return (
    <PageWrapper title="Player Approvals" className="flex flex-col space-y-4">
      <PageHeading>Approvals</PageHeading>
      <PermissionGuard userPermissions="canApprovePlayers">
        <UpdateEventsManagementTable data={data ?? []} isLoading={isLoading} />
      </PermissionGuard>
    </PageWrapper>
  );
};
