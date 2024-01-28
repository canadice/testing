import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Progress,
  Tbody,
  Td,
  Tooltip,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import classnames from 'classnames';
import { useMemo } from 'react';
import { TeamAchievement, Team } from 'typings';
import { isValidID } from 'utils/isValidID';
import { query } from 'utils/query';

import { AchievementTeamDetail } from './AchievementTeamDetail';
import { AchievementTeamLogo } from './AchievementTeamLogo';
import { WINNING_ACHIEVEMENT_IDS, DEFUNCT_TEAMS } from './constants';

export const TeamAchievementTable = ({
  heading,
  loading,
  teamAchievements,
  noBottomBorder = false,
}: {
  heading: string;
  loading: boolean;
  teams: Team[];
  teamAchievements: TeamAchievement[];
  noBottomBorder?: boolean;
}) => {
  const leagueWinnerRecord = useMemo(
    () =>
      teamAchievements.find((record) =>
        WINNING_ACHIEVEMENT_IDS.includes(record.achievement),
      ),
    [teamAchievements],
  );

  const validSeasonValue = useMemo(
    () =>
      (leagueWinnerRecord?.seasonID ?? 0) > 52
        ? leagueWinnerRecord?.seasonID
        : 53,
    [leagueWinnerRecord?.seasonID],
  );

  const { data, isLoading: teamLoading } = useQuery<Team>({
    queryKey: [
      'achievementTeamsQuery',
      leagueWinnerRecord?.teamID,
      leagueWinnerRecord?.leagueID,
      validSeasonValue,
    ],
    queryFn: () =>
      query(
        `api/v1/teams/${leagueWinnerRecord?.teamID}?league=${leagueWinnerRecord?.leagueID}&season=${validSeasonValue}`,
        undefined,
        true,
      ),
    enabled:
      isValidID(leagueWinnerRecord?.teamID) &&
      isValidID(leagueWinnerRecord?.leagueID) &&
      isValidID(leagueWinnerRecord?.seasonID),
  });

  const leagueWinner = useMemo(() => {
    if (teamLoading) return undefined;

    if (data) return data;

    const defunctTeam = DEFUNCT_TEAMS.find(
      (team) => team.id === leagueWinnerRecord?.teamID,
    );

    if (defunctTeam) return defunctTeam;
  }, [leagueWinnerRecord?.teamID, data, teamLoading]);

  const otherAchievements = useMemo(
    () =>
      teamAchievements.filter(
        (record) => !WINNING_ACHIEVEMENT_IDS.includes(record.achievement),
      ),
    [teamAchievements],
  );

  if (teamAchievements.length === 0) return null;

  return (
    <>
      <div
        className={classnames(
          !noBottomBorder && 'border-b-4 border-b-blue600',
          ' bg-grey900 p-2 text-grey100',
        )}
      >
        <div className="flex justify-between font-bold">
          <span>{heading}</span>
        </div>
      </div>
      {leagueWinner && (
        <div
          style={{ backgroundColor: leagueWinner?.colors?.primary }}
          className="flex justify-center p-4"
        >
          <AchievementTeamLogo
            team={leagueWinner}
            className="m-2 max-h-20 lg:max-h-28"
          />
          <div className="my-auto flex flex-col text-[color:white]">
            <h1 className="sm:text-3xl">
              {leagueWinnerRecord?.achievementName}:
            </h1>
            <h1 className="text-lg font-bold sm:text-4xl">
              {leagueWinner.name}
            </h1>
          </div>
        </div>
      )}

      <TableContainer overflowY="visible" className="pt-2">
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>Achievement</Th>
              <Th>Team</Th>
            </Tr>
          </Thead>
          {loading ? (
            <Tbody>
              <Tr>
                <Td colSpan={2}>
                  <Progress size="xs" isIndeterminate />
                </Td>
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {otherAchievements.map((record) => (
                <Tr
                  key={`${record.achievement}-${record.seasonID}-${record.leagueID}-${record.teamID}`}
                >
                  <Td>
                    <Tooltip label={record.achievementDescription}>
                      {record.achievementName}
                    </Tooltip>
                  </Td>
                  <Td>
                    <AchievementTeamDetail achievement={record} />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          )}
        </Table>
      </TableContainer>
    </>
  );
};
