import { Select, Skeleton } from '@chakra-ui/react';
import { Link } from 'components/common/Link';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { TeamCard } from 'components/common/TeamCard';
import { useSecondaryTeamsInfo } from 'hooks/useSecondaryTeamsInfo';
import { useTeamInfo } from 'hooks/useTeamInfo';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default () => {
  const [league, setLeague] = useState(0);

  const { shlTeams, smjhlTeams, loading: teamsLoading } = useTeamInfo();
  const { iihfTeams, loading: secondaryTeamsLoading } = useSecondaryTeamsInfo();

  const router = useRouter();

  const setLeagueCallback = useCallback(
    (value: number) => {
      router.replace(`/teams?league=${value}`);
    },
    [router],
  );

  useEffect(() => {
    if (router.query?.league) {
      if (Number(router.query.league) !== league)
        setLeague(Number(router.query.league));
    }
  }, [league, router.query.league]);

  const filteredTeams = useMemo(() => {
    if (league === 1) {
      return { teams: smjhlTeams, loading: teamsLoading, count: 14 };
    }

    if (league === 2) {
      return { teams: iihfTeams, loading: secondaryTeamsLoading, count: 14 };
    }

    return { teams: shlTeams, loading: teamsLoading, count: 21 };
  }, [
    iihfTeams,
    league,
    secondaryTeamsLoading,
    shlTeams,
    smjhlTeams,
    teamsLoading,
  ]);

  const sortedTeams = useMemo(
    () =>
      filteredTeams?.teams.sort((a, b) => {
        if (league === 0 || league === 1) {
          return a.nameDetails.first.localeCompare(b.nameDetails.first);
        }
        return a.nameDetails.second.localeCompare(b.nameDetails.second);
      }),
    [filteredTeams, league],
  );

  return (
    <PageWrapper title="Teams" className="flex flex-col space-y-4">
      <PageHeading>Teams</PageHeading>
      <Select
        value={league}
        onChange={(e) => {
          setLeagueCallback(parseInt(e.target.value));
        }}
      >
        <option value={0}>Simulation Hockey League (SHL)</option>
        <option value={1}>Simulation Major Junior Hockey League (SMJHL)</option>
        <option value={2}>IIHF World Championship (IIHF)</option>
      </Select>
      <div className="grid auto-rows-[100px] grid-cols-[repeat(auto-fill,_minmax(320px,_1fr))] gap-4 sm:grid-cols-[repeat(auto-fill,_minmax(500px,_1fr))]">
        {filteredTeams.loading &&
          Array.from({ length: filteredTeams.count }, (_, i) => i + 1).map(
            (count) => (
              <Skeleton key={`${league}-${count}`} className="w-full" />
            ),
          )}
        {sortedTeams?.map((team) => (
          <TeamCard key={`${team.id}-${team.league}`} team={team} />
        ))}
        {league === 0 && !filteredTeams.loading && (
          <Link
            href="/teams/shl/ufa"
            className="flex h-full w-full items-center bg-grey500 px-4"
          >
            <h2>
              <span className="block font-mont font-normal tracking-widest">
                SHL
              </span>
              <span className="font-semibold uppercase tracking-[0.15rem]">
                Unrestricted Free Agents
              </span>
            </h2>
          </Link>
        )}
      </div>
    </PageWrapper>
  );
};
