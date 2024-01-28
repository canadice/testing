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
import classnames from 'classnames';
import { Link } from 'components/common/Link';
import { Team, PlayerAchievement } from 'typings';

import { AchievementTeamDetail } from './AchievementTeamDetail';

export const PlayerAchievementTable = ({
  heading,
  loading,
  playerAchievements,
  noBottomBorder = false,
}: {
  heading: string;
  loading: boolean;
  teams: Team[];
  playerAchievements: PlayerAchievement[];
  noBottomBorder?: boolean;
}) => {
  if (playerAchievements.length === 0) return null;

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

      <TableContainer overflowY="visible" className="pt-2">
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>Achievement</Th>
              <Th>Player</Th>
              <Th>Team</Th>
            </Tr>
          </Thead>
          {loading ? (
            <Tbody>
              <Tr>
                <Td colSpan={3}>
                  <Progress size="xs" isIndeterminate />
                </Td>
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {playerAchievements.map((record, index) => (
                <Tr
                  key={`${record.achievement}-${record.playerName}-${record.leagueID}-${record.playerUpdateID}-${index}`}
                >
                  <Td>
                    <Tooltip label={record.achievementDescription}>
                      {record.achievementName}
                    </Tooltip>
                    {record.isAward && !record.won && (
                      <span className="text-sm font-light"> (nominated)</span>
                    )}
                  </Td>
                  <Td>
                    {record.playerUpdateID || record.userID ? (
                      <Link
                        className="!hover:no-underline mr-2 font-mont text-blue600 hover:text-blue700 focus:text-blue700"
                        href={
                          record.playerUpdateID
                            ? `/player/${record.playerUpdateID}`
                            : `https://simulationhockey.com/member.php?action=profile&uid=${record.userID}`
                        }
                      >
                        {record.playerName}
                      </Link>
                    ) : (
                      <>{record.playerName}</>
                    )}
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
