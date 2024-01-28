import { TeamLogo } from 'components/common/TeamLogo';
import { Team } from 'typings';
import { leagueIdToName } from 'utils/leagueHelpers';

export const AchievementTeamLogo = ({
  team,
  className,
}: {
  team?: Partial<Team>;
  className?: string;
}) => {
  if (!team) return null;

  return (
    <TeamLogo
      teamAbbreviation={team.abbreviation}
      league={leagueIdToName(team?.league ?? 0)}
      className={className ? className : `mr-2 max-h-5 lg:max-h-6`}
    />
  );
};
