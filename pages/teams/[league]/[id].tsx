import { Tabs, Tab, TabList, TabPanels, TabPanel } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import classnames from 'classnames';
import { PageWrapper } from 'components/common/PageWrapper';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { TeamBankTable } from 'components/common/tables/TeamBankTable';
import { TeamLogo } from 'components/common/TeamLogo';
import { TeamHistoryPanel } from 'components/history/TeamHistoryPanel';
import type { GetServerSideProps } from 'next/types';
import { useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { Player, Team } from 'typings';
import { InternalLeague } from 'typings/portal-db';
import { leagueIdToName, leagueNameToId } from 'utils/leagueHelpers';
import { query } from 'utils/query';

export default ({
  league,
  team,
}: {
  league: InternalLeague;
  team: number | string;
}) => {
  const teamPage = useMemo(() => team !== 'ufa', [team]);

  const leagueID = useMemo(() => leagueNameToId(league), [league]);

  const teamID = useMemo(() => {
    if (typeof team === 'string') return parseInt(team);
    else return team;
  }, [team]);

  const { data: teamData } = useQuery<Team>({
    queryKey: ['team', team, leagueID],
    queryFn: () =>
      query(`api/v1/teams/${team}?league=${leagueID}`, undefined, true),
    enabled: teamPage,
  });

  const { data: roster, isLoading: playersLoading } = useQuery<Player[]>({
    queryKey: ['teamRoster', teamPage, leagueID, team],
    queryFn: () =>
      query(
        `api/v1/player?${
          teamPage
            ? `teamID=${team}&leagueID=${leagueID}${
                leagueID === 2 ? '&status=active' : ''
              }`
            : `teamID=${team}`
        }`,
      ),
  });

  const leagueName = useMemo(() => {
    if (teamData?.league !== undefined) {
      return leagueIdToName(teamData?.league);
    }
  }, [teamData?.league]);

  const { data: prospects, isLoading: prospectsLoading } = useQuery<Player[]>({
    queryKey: ['teamProspects', team, leagueName, teamPage],
    queryFn: () => query(`api/v1/player?teamRightsID=${team}&leagueID=1`),
    enabled: leagueName !== undefined && leagueName === 'shl' && teamPage,
  });

  return (
    <PageWrapper
      className="flex flex-col space-y-4"
      title={teamData?.name ?? 'Team'}
      {...(teamData
        ? {
            additionalMetaTags: [
              { property: 'theme-color', content: teamData.colors.primary },
            ],
          }
        : {})}
    >
      {teamData && (
        <div
          style={{ backgroundColor: teamData.colors.primary }}
          className="mx-[-2.525%] mt-[-1rem] 2xl:mx-[-4rem]"
        >
          <div className="flex items-center px-[2.5%] py-4 2xl:px-16">
            {leagueName && teamPage && (
              <TeamLogo
                teamAbbreviation={teamData.abbreviation}
                league={leagueName}
                className="m-2 mr-8 max-h-28 drop-shadow-[0_0_1.15rem_rgba(0,_0,_0,_0.4)] lg:max-h-36"
              />
            )}

            <h2
              className={classnames(
                'text-3xl',
                tinycolor(teamData.colors.primary).isDark()
                  ? 'text-grey100'
                  : 'text-grey900',
              )}
            >
              <span className="block font-mont font-normal tracking-widest">
                {teamData.nameDetails.first}
              </span>
              <span className="font-semibold uppercase tracking-[0.15rem]">
                {teamData.nameDetails.second}
              </span>
            </h2>
          </div>
        </div>
      )}
      <Tabs isLazy>
        <TabList>
          <Tab>{teamPage ? 'Roster' : 'Unrestricted Free Agents'}</Tab>
          {leagueName === 'shl' && teamPage && <Tab>Prospects</Tab>}
          <Tab>Bank Accounts</Tab>
          <Tab>History</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PlayerTable
              data={roster ?? []}
              isLoading={playersLoading}
              isPaginated={false}
            />
          </TabPanel>
          {leagueName === 'shl' && teamPage && (
            <TabPanel>
              <PlayerTable
                data={prospects ?? []}
                isLoading={prospectsLoading}
                isPaginated={false}
              />
            </TabPanel>
          )}
          <TabPanel>
            <TeamBankTable
              data={[...(roster ?? []), ...(prospects ?? [])]}
              isLoading={playersLoading}
            />
          </TabPanel>
          <TabPanel>
            <TeamHistoryPanel leagueID={leagueID} teamID={teamID} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </PageWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { league, id } = ctx.query;
  return { props: { league, team: id } };
};
