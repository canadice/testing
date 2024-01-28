import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { PermissionGuard } from 'components/auth/PermissionGuard';
import { RoleGuard } from 'components/auth/RoleGuard';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { GMManagement } from 'components/headOffice/GMManagment';
import { NewSeason } from 'components/headOffice/NewSeason';
import { PlayerManagement } from 'components/headOffice/PlayerManagement';
import { useSession } from 'contexts/AuthContext';
import { useRedirectIfUnauthed } from 'hooks/useRedirectIfUnauthed';
import { useRouter } from 'next/router';
import { memo, useEffect, useMemo } from 'react';
import { GeneralManager } from 'typings';
import { query } from 'utils/query';

export default () => {
  const { loggedIn } = useSession();

  useRedirectIfUnauthed('/', {
    roles: [
      'SHL_COMMISSIONER',
      'SMJHL_COMMISSIONER',
      'SHL_HO',
      'SMJHL_HO',
      'SMJHL_INTERN',
    ],
  });

  const { data: managers, isLoading: managersLoading } = useQuery<
    GeneralManager[]
  >({
    queryKey: ['managementManagers'],
    queryFn: () => query('/api/v1/manager'),
  });

  const router = useRouter();

  useEffect(() => {
    if (!loggedIn) {
      router.replace('/');
    }
  }, [loggedIn, router]);

  const { shlManagers, smjhlManagers } = useMemo(() => {
    return {
      shlManagers: managers?.filter((manager) => manager.leagueID === 0) ?? [],
      smjhlManagers:
        managers?.filter((manager) => manager.leagueID === 1) ?? [],
    };
  }, [managers]);

  const MemoizedSHLManagement = memo(() => (
    <GMManagement leagueID={0} managers={shlManagers} />
  ));

  const MemoizedSMJHLManagement = memo(() => (
    <GMManagement leagueID={1} managers={smjhlManagers} />
  ));

  return (
    <PageWrapper
      title="Head Office"
      className="flex flex-col space-y-4"
      loading={managersLoading}
    >
      <PageHeading>Head Office</PageHeading>
      <RoleGuard
        userRoles={[
          'SMJHL_HO',
          'SHL_HO',
          'SHL_COMMISSIONER',
          'SMJHL_COMMISSIONER',
          'SMJHL_INTERN',
        ]}
      >
        <Tabs isFitted isLazy variant="enclosed-colored">
          <TabList>
            <Tab>GM Management</Tab>
            <Tab>Player Management</Tab>
            <PermissionGuard userPermissions="canStartNextSeason">
              <Tab>New Season</Tab>
            </PermissionGuard>
          </TabList>
          <TabPanels>
            <TabPanel paddingX={0}>
              <Tabs isLazy>
                <TabList>
                  <Tab>SHL</Tab>
                  <Tab>SMJHL</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <PermissionGuard
                      userPermissions="canAssignSHLGMRole"
                      fallback={
                        <div>You don&apos;t have permissions for this.</div>
                      }
                    >
                      <MemoizedSHLManagement />
                    </PermissionGuard>
                  </TabPanel>
                  <TabPanel>
                    <PermissionGuard
                      userPermissions="canAssignSMJHLGMRole"
                      fallback={
                        <div>You don&apos;t have permissions for this.</div>
                      }
                    >
                      <MemoizedSMJHLManagement />
                    </PermissionGuard>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </TabPanel>
            <TabPanel>
              <PlayerManagement />
            </TabPanel>
            <PermissionGuard userPermissions="canStartNextSeason">
              <TabPanel>
                <NewSeason />
              </TabPanel>
            </PermissionGuard>
          </TabPanels>
        </Tabs>
      </RoleGuard>
    </PageWrapper>
  );
};
