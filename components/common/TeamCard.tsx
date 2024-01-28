import { Skeleton } from '@chakra-ui/react';
import classnames from 'classnames';
import { useCallback, useState } from 'react';
import tinycolor from 'tinycolor2';
import { Team } from 'typings';
import { leagueIdToName } from 'utils/leagueHelpers';

import { Link } from './Link';
import { TeamLogo } from './TeamLogo';

export const TeamCard = ({ team }: { team: Team }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const handleOnImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  return (
    <Link
      href={`/teams/${leagueIdToName(team.league)}/${team.id}`}
      className="flex w-full items-center px-4"
      style={{ backgroundColor: team.colors.primary }}
    >
      <Skeleton
        isLoaded={isImageLoaded}
        className="flex h-[80px] w-[80px]"
        startColor={team.colors.primary}
      >
        <TeamLogo
          teamAbbreviation={team.abbreviation}
          league={leagueIdToName(team.league)}
          className="m-2 w-4/5 drop-shadow-[0_0_1.15rem_rgba(0,_0,_0,_0.4)]"
          onLoad={handleOnImageLoad}
        />
      </Skeleton>
      <h2
        className={classnames(
          'ml-4 text-2xl',
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
