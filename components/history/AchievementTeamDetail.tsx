import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DraftInfo, PlayerAchievement, Team, TeamAchievement } from 'typings';
import { isValidID } from 'utils/isValidID';
import { query } from 'utils/query';

import { AchievementTeamLogo } from './AchievementTeamLogo';
import { DEFUNCT_TEAMS } from './constants';

export const AchievementTeamDetail = ({
  achievement,
}: {
  achievement?: DraftInfo | PlayerAchievement | TeamAchievement;
  className?: string;
}) => {
  const validSeasonValue = useMemo(
    () => ((achievement?.seasonID ?? 0) > 52 ? achievement?.seasonID : 53),
    [achievement?.seasonID],
  );

  const { data, isLoading: teamLoading } = useQuery<Team>({
    queryKey: [
      'achievementTeamQuery',
      achievement?.teamID,
      achievement?.leagueID,
      validSeasonValue,
    ],
    queryFn: () =>
      query(
        `api/v1/teams/${achievement?.teamID}?league=${achievement?.leagueID}&season=${validSeasonValue}`,
        undefined,
        true,
      ),
    enabled:
      isValidID(achievement?.teamID) &&
      isValidID(achievement?.leagueID) &&
      isValidID(achievement?.seasonID),
  });

  const achievementTeam = useMemo(() => {
    if (teamLoading) return undefined;

    if (data) return data;

    const defunctTeam = DEFUNCT_TEAMS.find(
      (team) => team.id === achievement?.teamID,
    );

    if (defunctTeam) return defunctTeam;
  }, [achievement?.teamID, data, teamLoading]);

  if (!achievementTeam) return null;

  return (
    <div className="flex flex-nowrap items-center align-middle">
      <AchievementTeamLogo team={achievementTeam} />
      {achievementTeam.name}
    </div>
  );
};
