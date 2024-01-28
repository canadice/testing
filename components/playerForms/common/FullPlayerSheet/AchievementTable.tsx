import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tooltip,
} from '@chakra-ui/react';
import classNames from 'classnames';
import { AchievementTeamDetail } from 'components/history/AchievementTeamDetail';
import { WINNING_ACHIEVEMENT_IDS } from 'components/history/constants';
import { LEAGUE_LINK_MAP } from 'components/playerForms/constants';
import { PlayerAchievement } from 'typings';

export const AchievementTable = ({
  achievements,
}: {
  achievements: PlayerAchievement[];
}) => {
  if (!achievements || achievements.length === 0) return null;

  return (
    <div>
      <div className="border-b-2 p-2">
        <div className="flex justify-between text-sm font-bold">
          <span>Player Achievements</span>
        </div>
      </div>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Achievement</Th>
              <Th>Season</Th>
              <Th>League</Th>
              <Th>Team</Th>
            </Tr>
          </Thead>
          <Tbody>
            {achievements.map((record) => (
              <Tr
                key={`${record.achievementName}-${record.seasonID}`}
                className={classNames(
                  WINNING_ACHIEVEMENT_IDS.includes(record.achievement) &&
                    'border-l-blue600 border-2',
                )}
              >
                <Td>
                  <Tooltip label={record.achievementDescription}>
                    {record.achievementName}
                  </Tooltip>
                  {record.isAward && !record.won && (
                    <span className="text-sm font-light"> (nominated)</span>
                  )}
                </Td>
                <Td>{record.seasonID}</Td>
                <Td>{LEAGUE_LINK_MAP[record.leagueID]}</Td>
                <Td>
                  <AchievementTeamDetail achievement={record} />
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};
