import { Select } from '@chakra-ui/react';
import { FullDraftTable } from 'components/history/FullDraftTable';
import { PlayerAchievementTable } from 'components/history/PlayerAchievementTable';
import { TeamAchievementTable } from 'components/history/TeamAchievementTable';
import { useDraftInfo } from 'hooks/useDraftInfo';
import { usePlayerAchievements } from 'hooks/usePlayerAchievements';
import { useSeason } from 'hooks/useSeason';
import { useSecondaryTeamsInfo } from 'hooks/useSecondaryTeamsInfo';
import { useTeamAchievements } from 'hooks/useTeamAchievements';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { isValidID } from 'utils/isValidID';
import { leagueIdToName } from 'utils/leagueHelpers';

export const TeamHistoryPanel = ({
  leagueID,
  teamID,
}: {
  leagueID: number;
  teamID: number;
}) => {
  const { season, loading: seasonLoading } = useSeason();
  const searchParams = useSearchParams();
  const seasonParam = searchParams.get('season');
  const { shlTeams, smjhlTeams, loading: teamsLoading } = useTeamInfo();
  const { iihfTeams, loading: secondaryTeamsLoading } = useSecondaryTeamsInfo();

  const selectedSeason = useMemo(() => {
    if (!seasonParam || isNaN(parseInt(seasonParam ?? ''))) {
      return season + 1;
    } else {
      return parseInt(seasonParam);
    }
  }, [season, seasonParam]);

  const applicableTeam = useMemo(() => {
    if (leagueID === 0) {
      return shlTeams.filter((team) => team.id === teamID);
    }
    if (leagueID === 1) {
      return smjhlTeams.filter((team) => team.id === teamID);
    }
    if (leagueID === 2) {
      return iihfTeams.filter((team) => team.id === teamID);
    }
    return [];
  }, [iihfTeams, leagueID, shlTeams, smjhlTeams, teamID]);

  const { draftInfo, loading: draftInfoLoading } = useDraftInfo({
    season: selectedSeason,
    leagueID,
    teamID,
    enabled: Boolean(
      selectedSeason > 0 && isValidID(leagueID) && isValidID(teamID),
    ),
  });
  const { teamAchievements, loading: teamAchievementsLoading } =
    useTeamAchievements({
      season: selectedSeason,
      leagueID,
      teamID,
      enabled: Boolean(
        selectedSeason > 0 && isValidID(leagueID) && isValidID(teamID),
      ),
    });
  const { playerAchievements, loading: playerAchievementsLoading } =
    usePlayerAchievements({
      season: selectedSeason,
      leagueID,
      teamID,
      enabled: Boolean(
        selectedSeason > 0 && isValidID(leagueID) && isValidID(teamID),
      ),
    });

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const router = useRouter();

  const setSeasonCallback = useCallback(
    (value: number) => {
      router.push(
        `/teams/${leagueIdToName(leagueID)}/${teamID}?${createQueryString(
          'season',
          `${value}`,
        )}`,
      );
    },
    [createQueryString, leagueID, router, teamID],
  );

  return (
    <>
      <div className="bg-grey900 p-2 text-lg font-bold text-grey100 sm:text-xl">
        <div className="flex items-center justify-between">
          <span className="font-bold">History</span>
          <div className="flex items-center justify-end space-x-4 text-sm">
            {!seasonLoading && (
              <>
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
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <TeamAchievementTable
          heading={`S${selectedSeason ?? season + 1} Team Achievements`}
          teamAchievements={teamAchievements}
          loading={
            teamAchievementsLoading || teamsLoading || secondaryTeamsLoading
          }
          teams={applicableTeam}
          noBottomBorder
        />

        <FullDraftTable
          heading={`S${selectedSeason ?? season + 1} Draft`}
          draftInfo={draftInfo}
          loading={draftInfoLoading || teamsLoading || secondaryTeamsLoading}
          teams={applicableTeam}
          noBottomBorder
          showAll
        />

        <PlayerAchievementTable
          heading={`S${selectedSeason ?? season + 1} Player Achievements`}
          playerAchievements={playerAchievements}
          loading={
            playerAchievementsLoading || teamsLoading || secondaryTeamsLoading
          }
          teams={applicableTeam}
          noBottomBorder
        />
      </div>
    </>
  );
};
