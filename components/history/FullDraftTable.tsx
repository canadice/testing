import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Progress,
  Tbody,
  Td,
  Button,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { Link } from 'components/common/Link';
import { useEffect, useMemo, useState } from 'react';
import { DraftInfo, Team } from 'typings';

import { AchievementTeamDetail } from './AchievementTeamDetail';

export const FullDraftTable = ({
  heading,
  draftInfo,
  loading,
  showAll = false,
  noBottomBorder = false,
}: {
  heading: string;
  draftInfo: DraftInfo[];
  loading: boolean;
  teams: Team[];
  showAll?: boolean;
  noBottomBorder?: boolean;
}) => {
  const [viewAll, setViewAll] = useState(showAll);

  useEffect(() => {
    if (viewAll && !showAll) setViewAll(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftInfo]);

  const visibleRounds = useMemo(() => {
    if (viewAll) return draftInfo;
    else return draftInfo.filter((record) => record.round === 1);
  }, [viewAll, draftInfo]);

  if (draftInfo.length === 0) return null;

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
              <Th>Overall</Th>
              <Th>Team</Th>
              <Th>Player</Th>
              <Th>Round</Th>
              <Th>Pick</Th>
            </Tr>
          </Thead>
          {loading ? (
            <Tbody>
              <Tr>
                <Td colSpan={5}>
                  <Progress size="xs" isIndeterminate />
                </Td>
              </Tr>
            </Tbody>
          ) : (
            <Tbody>
              {visibleRounds.map((record, index) => (
                <Tr
                  key={`${record.round}-${record.draftNumber}-${record.leagueID}-${record.playerName}`}
                >
                  <Td>{index + 1}</Td>
                  <Td>
                    <AchievementTeamDetail achievement={record} />
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
                  <Td>{record.round}</Td>
                  <Td>{record.draftNumber}</Td>
                </Tr>
              ))}
              {!showAll && (
                <Tr className="bg-grey100">
                  <Td colSpan={5}>
                    <Button
                      className="float-right"
                      variant="link"
                      onClick={() => setViewAll((prev) => !prev)}
                    >
                      {viewAll ? 'Collapse' : 'View All'}
                    </Button>
                  </Td>
                </Tr>
              )}
            </Tbody>
          )}
        </Table>
      </TableContainer>
    </>
  );
};
