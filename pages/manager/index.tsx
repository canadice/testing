import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Card,
  CardBody,
  Stack,
  Alert,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react';
import { RoleGuard } from 'components/auth/RoleGuard';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { CallUp } from 'components/manager/CallUp';
import { Prospects } from 'components/manager/Prospects';
import { Release } from 'components/manager/Release';
import { SendDown } from 'components/manager/SendDown';
import { SignFreeAgent } from 'components/manager/SignFreeAgent';
import { Trade } from 'components/manager/Trade';
import { TeamLogo } from 'components/TeamLogo';
import { useCurrentManagedTeam } from 'hooks/useCurrentManagedTeam';
import { useRedirectIfUnauthed } from 'hooks/useRedirectIfUnauthed';
import { useTeamInfo } from 'hooks/useTeamInfo';

export default () => {
  const { managedTeam, loading } = useCurrentManagedTeam();
  const { shlTeams, smjhlTeams, loading: teamsLoading } = useTeamInfo();

  useRedirectIfUnauthed('/', { roles: ['SHL_GM', 'SMJHL_GM'] });

  return (
    <PageWrapper
      title={
        managedTeam ? `${managedTeam?.name} Team Management` : 'Team Management'
      }
      className="flex flex-col space-y-4"
      loading={loading || teamsLoading}
    >
      <PageHeading>Team Management</PageHeading>
      {!loading && !managedTeam && (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
        >
          <AlertIcon />
          <AlertTitle>You aren&apos;t currently managing a Team</AlertTitle>
        </Alert>
      )}
      <RoleGuard userRoles={['SHL_GM', 'SMJHL_GM']}>
        {managedTeam && (
          <>
            <Card
              direction="row"
              overflow="hidden"
              variant="outline"
              border="none"
              style={{ backgroundColor: managedTeam.colors.primary }}
            >
              <TeamLogo
                teamAbbreviation={managedTeam.abbreviation}
                league={managedTeam.league === 0 ? 'shl' : 'smjhl'}
                className="m-2 max-h-20 lg:max-h-28"
              />
              <Stack>
                <CardBody className="flex">
                  <h1 className="m-auto text-4xl font-bold text-[color:white]">
                    {managedTeam.name}
                  </h1>
                </CardBody>
              </Stack>
            </Card>

            <Tabs isFitted variant="enclosed-colored">
              {managedTeam.league === 0 && (
                <TabList>
                  <Tab>Players</Tab>
                  <Tab>Prospects</Tab>
                </TabList>
              )}
              <TabPanels>
                <TabPanel paddingX={0}>
                  <Tabs isLazy>
                    <TabList>
                      <Tab>Trade</Tab>
                      <Tab>Sign Free Agent</Tab>
                      <Tab>Release Player</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Trade
                          teamID={managedTeam.id}
                          league={managedTeam.league}
                          shlTeams={shlTeams}
                          smjhlTeams={smjhlTeams}
                        />
                      </TabPanel>
                      <TabPanel>
                        <SignFreeAgent
                          teamID={managedTeam.id}
                          league={managedTeam.league}
                          shlTeams={shlTeams}
                          smjhlTeams={smjhlTeams}
                        />
                      </TabPanel>
                      <TabPanel>
                        <Release
                          teamID={managedTeam.id}
                          league={managedTeam.league}
                          shlTeams={shlTeams}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
                <TabPanel paddingX={0}>
                  <Tabs isLazy>
                    <TabList>
                      <Tab>Assign Prospect</Tab>
                      <Tab>Call Up</Tab>
                      <Tab>Send Down</Tab>
                    </TabList>
                    <TabPanels>
                      <TabPanel>
                        <Prospects
                          teamID={managedTeam.id}
                          shlTeams={shlTeams ?? []}
                        />
                      </TabPanel>
                      <TabPanel>
                        <CallUp
                          teamID={managedTeam.id}
                          league={managedTeam.league}
                          shlTeams={shlTeams ?? []}
                          smjhlTeams={smjhlTeams ?? []}
                        />
                      </TabPanel>
                      <TabPanel>
                        <SendDown
                          teamID={managedTeam.id}
                          league={managedTeam.league}
                          shlTeams={shlTeams ?? []}
                          smjhlTeams={smjhlTeams ?? []}
                        />
                      </TabPanel>
                    </TabPanels>
                  </Tabs>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </>
        )}
      </RoleGuard>
    </PageWrapper>
  );
};
