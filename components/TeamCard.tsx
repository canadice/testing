import classnames from 'classnames';
import { useMemo } from 'react';
import tinycolor from 'tinycolor2';
import { Team } from 'typings';
import { leagueIdToName } from 'utils/leagueHelpers';

import { Link } from './common/Link';
import { TeamLogo } from './TeamLogo';

export const TeamCard = ({ team, bank }: { team: Team; bank?: boolean }) => {
  const pathName = useMemo(() => (bank ? '/bank/teams' : '/teams'), [bank]);

  return (
    <Link
      href={`${pathName}/${leagueIdToName(team.league)}/${team.id}`}
      className="flex h-full w-full items-center rounded-lg px-4"
      style={{ backgroundColor: team.colors.primary }}
    >
      <TeamLogo
        teamAbbreviation={team.abbreviation}
        league={leagueIdToName(team.league)}
        className="m-2 h-3/5 drop-shadow-[0_0_1.15rem_rgba(0,_0,_0,_0.4)]"
      />
      <h2
        className={classnames(
          'text-2xl',
          tinycolor(team.colors.primary).isDark()
            ? 'text-grey100'
            : 'text-grey900',
        )}
      >
        <span className="block font-mont font-normal tracking-widest">
          {team.nameDetails.first}
        </span>
        <span className="font-semibold uppercase tracking-[0.15rem]">
          {team.nameDetails.second}
        </span>
      </h2>
    </Link>
  );
};
