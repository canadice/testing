import { Tabs, TabList, Tab, Select } from '@chakra-ui/react';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { FullDraftTable } from 'components/history/FullDraftTable';
import { PlayerAchievementTable } from 'components/history/PlayerAchievementTable';
import { TeamAchievementTable } from 'components/history/TeamAchievementTable';
import { LEAGUE_LINK_MAP } from 'components/playerForms/constants';
import { useDraftInfo } from 'hooks/useDraftInfo';
import { usePlayerAchievements } from 'hooks/usePlayerAchievements';
import { useSeason } from 'hooks/useSeason';
import { useSecondaryTeamsInfo } from 'hooks/useSecondaryTeamsInfo';
import { useTeamAchievements } from 'hooks/useTeamAchievements';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isValidID } from 'utils/isValidID';

export default () => {
  const [tabIndex, setTabIndex] = useState(0);
  const { season, loading: seasonLoading } = useSeason();
  const searchParams = useSearchParams();
  const leagueParam = searchParams.get('league');
  const seasonParam = searchParams.get('season');
  const { shlTeams, smjhlTeams, loading: teamsLoading } = useTeamInfo();
  const {
    iihfTeams,
    wjcTeams,
    loading: secondaryTeamsLoading,
  } = useSecondaryTeamsInfo();

  const selectedSeason = useMemo(() => {
    if (!seasonParam || isNaN(parseInt(seasonParam ?? ''))) {
      return season + 1;
    } else {
      return parseInt(seasonParam);
    }
  }, [season, seasonParam]);

  const selectedLeague = useMemo(() => {
    if (!leagueParam || isNaN(parseInt(leagueParam ?? ''))) {
      return 0;
    } else {
      return parseInt(leagueParam);
    }
  }, [leagueParam]);

  useEffect(() => {
    if (tabIndex !== selectedLeague) {
      setTabIndex(selectedLeague);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- don't want this to run when tabIndex is changed
  }, [selectedLeague]);

  const applicableTeams = useMemo(() => {
    if (selectedLeague === 0) {
      return shlTeams;
    }
    if (selectedLeague === 1) {
      return smjhlTeams;
    }
    if (selectedLeague === 2) {
      return iihfTeams;
    }
    if (selectedLeague === 3) {
      return wjcTeams;
    }
    return [];
  }, [iihfTeams, selectedLeague, shlTeams, smjhlTeams, wjcTeams]);

  const { draftInfo, loading: draftInfoLoading } = useDraftInfo({
    season: selectedSeason,
    leagueID: selectedLeague,
    enabled: Boolean(selectedSeason > 0 && isValidID(selectedLeague)),
  });
  const { teamAchievements, loading: teamAchievementsLoading } =
    useTeamAchievements({
      season: selectedSeason,
      leagueID: selectedLeague,
      enabled: Boolean(selectedSeason > 0 && isValidID(selectedLeague)),
    });
  const { playerAchievements, loading: playerAchievementsLoading } =
    usePlayerAchievements({
      season: selectedSeason,
      leagueID: selectedLeague,
      enabled: Boolean(selectedSeason > 0 && isValidID(selectedLeague)),
    });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
    router.push(`/history?${createQueryString('league', `${index}`)}`);
  };

  const router = useRouter();

  const setSeasonCallback = useCallback(
    (value: number) => {
      router.push(`/history?${createQueryString('season', `${value}`)}`);
    },
    [createQueryString, router],
  );

  return (
    <PageWrapper
      title="League History"
      className="flex flex-col space-y-4"
      loading={seasonLoading}
    >
      <PageHeading>
        <div className="flex items-center justify-between">
          <span className="font-bold">League History</span>
          <div className="flex items-center justify-end space-x-4 text-sm">
            <span>Season: </span>
            <Select
              size="sm"
              defaultValue={seasonParam ?? season + 1}
              onChange={(e) => {
                setSeasonCallback(parseInt(e.target.value));
              }}
            >
              {Array.from({ length: season + 1 }, (_, i) => i + 1)
                .reverse()
                .map((seasonID) => (
                  <option
                    key={seasonID}
                    value={seasonID}
                    className="text-grey900"
                  >
                    {seasonID}
                  </option>
                ))}
            </Select>
          </div>
        </div>
      </PageHeading>

      <Tabs
        isFitted
        variant="enclosed-colored"
        index={tabIndex}
        onChange={handleTabsChange}
      >
        <TabList>
          <Tab>SHL</Tab>
          <Tab>SMJHL</Tab>
          <Tab>IIHF</Tab>
          <Tab>WJC</Tab>
        </TabList>
        <div className="space-y-4 pt-4">
          <TeamAchievementTable
            heading={`S${selectedSeason ?? season + 1} ${
              LEAGUE_LINK_MAP[selectedLeague ?? 0]
            } Team Achievements`}
            teamAchievements={teamAchievements}
            loading={
              teamAchievementsLoading || teamsLoading || secondaryTeamsLoading
            }
            teams={applicableTeams}
          />

          <FullDraftTable
            heading={`S${selectedSeason ?? season + 1} ${
              LEAGUE_LINK_MAP[selectedLeague ?? 0]
            } Draft`}
            draftInfo={draftInfo}
            loading={draftInfoLoading || teamsLoading || secondaryTeamsLoading}
            teams={applicableTeams}
          />

          <PlayerAchievementTable
            heading={`S${selectedSeason ?? season + 1} ${
              LEAGUE_LINK_MAP[selectedLeague ?? 0]
            } Player Achievements`}
            playerAchievements={playerAchievements}
            loading={
              playerAchievementsLoading || teamsLoading || secondaryTeamsLoading
            }
            teams={applicableTeams}
          />
        </div>
      </Tabs>
    </PageWrapper>
  );
};
