import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import { AchievementTeamDetail } from 'components/history/AchievementTeamDetail';
import { useMemo } from 'react';
import { DraftInfo } from 'typings';

export const DraftInfoTable = ({ draftInfo }: { draftInfo: DraftInfo[] }) => {
  const smjhlDraftRecord = useMemo(
    () =>
      draftInfo.some((record) => record.leagueID === 1)
        ? draftInfo.filter((record) => record.leagueID === 1)[0]
        : undefined,
    [draftInfo],
  );
  const shlDraftRecord = useMemo(
    () =>
      draftInfo.some((record) => record.leagueID === 0)
        ? draftInfo.filter((record) => record.leagueID === 0)[0]
        : undefined,
    [draftInfo],
  );

  if (!draftInfo || draftInfo.length === 0) return null;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6">
      <div className="grid w-full grid-cols-1 gap-6 text-sm md:grid-cols-2">
        <div className="flex flex-col flex-nowrap">
          <span className="mr-2 border-b-2 p-2 font-bold">SMJHL Draft</span>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Season</Th>
                  <Th>Round</Th>
                  <Th>Pick</Th>
                  <Th>Team</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  {smjhlDraftRecord && (
                    <>
                      <Td>{smjhlDraftRecord.seasonID}</Td>
                      <Td>{smjhlDraftRecord.round}</Td>
                      <Td>{smjhlDraftRecord.draftNumber}</Td>
                      <Td>
                        <AchievementTeamDetail achievement={smjhlDraftRecord} />
                      </Td>
                    </>
                  )}
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </div>
        <div className="flex flex-col flex-nowrap">
          <span className="mr-2 border-b-2 p-2 font-bold">SHL Draft</span>
          <TableContainer>
            <Table size="sm">
              <Thead>
                <Tr>
                  <Th>Season</Th>
                  <Th>Round</Th>
                  <Th>Pick</Th>
                  <Th>Team</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  {shlDraftRecord && (
                    <>
                      <Td>{shlDraftRecord.seasonID}</Td>
                      <Td>{shlDraftRecord.round}</Td>
                      <Td>{shlDraftRecord.draftNumber}</Td>
                      <Td>
                        <AchievementTeamDetail achievement={shlDraftRecord} />
                      </Td>
                    </>
                  )}
                </Tr>
              </Tbody>
            </Table>
          </TableContainer>
        </div>
      </div>
    </div>
  );
};
