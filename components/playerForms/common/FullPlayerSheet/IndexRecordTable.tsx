import {
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
} from '@chakra-ui/react';
import { Link } from 'components/common/Link';
import { LEAGUE_LINK_MAP } from 'components/playerForms/constants';
import { generateIndexLink } from 'components/playerForms/shared';
import { IndexPlayerID } from 'typings';

export const IndexRecordTable = ({
  indexRecords,
}: {
  indexRecords: IndexPlayerID[] | null;
}) => {
  if (!indexRecords || indexRecords.length === 0) return null;

  return (
    <div>
      <div className="border-b-2 p-2">
        <div className="flex justify-between text-sm font-bold">
          <span>Index Links</span>
        </div>
      </div>
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              {indexRecords.some((record) => record.leagueID === 0) && (
                <Th>{LEAGUE_LINK_MAP.at(0)}</Th>
              )}
              {indexRecords.some((record) => record.leagueID === 1) && (
                <Th>{LEAGUE_LINK_MAP.at(1)}</Th>
              )}
              {indexRecords.some((record) => record.leagueID === 2) && (
                <Th>{LEAGUE_LINK_MAP.at(2)}</Th>
              )}
              {indexRecords.some((record) => record.leagueID === 3) && (
                <Th>{LEAGUE_LINK_MAP.at(3)}</Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              {indexRecords.some((record) => record.leagueID === 0) && (
                <Td>
                  {indexRecords
                    .filter((record) => record.leagueID === 0)
                    .map((record) => (
                      <Link
                        key={`${record.indexID}-${record.leagueID}`}
                        className="!hover:no-underline mr-2 font-mont hover:text-blue600 focus:text-blue600"
                        target="_blank"
                        href={generateIndexLink(record)}
                      >
                        {`S${record.startSeason}`}
                      </Link>
                    ))}
                </Td>
              )}
              {indexRecords.some((record) => record.leagueID === 1) && (
                <Td>
                  {indexRecords
                    .filter((record) => record.leagueID === 1)
                    .map((record) => (
                      <Link
                        key={`${record.indexID}-${record.leagueID}`}
                        className="!hover:no-underline mr-2 font-mont hover:text-blue600 focus:text-blue600"
                        target="_blank"
                        href={generateIndexLink(record)}
                      >
                        {`S${record.startSeason}`}
                      </Link>
                    ))}
                </Td>
              )}
              {indexRecords.some((record) => record.leagueID === 2) && (
                <Td>
                  {indexRecords
                    .filter((record) => record.leagueID === 2)
                    .map((record) => (
                      <Link
                        key={`${record.indexID}-${record.leagueID}`}
                        className="!hover:no-underline mr-2 font-mont hover:text-blue600 focus:text-blue600"
                        target="_blank"
                        href={generateIndexLink(record)}
                      >
                        {`S${record.startSeason}`}
                      </Link>
                    ))}
                </Td>
              )}
              {indexRecords.some((record) => record.leagueID === 3) && (
                <Td>
                  {indexRecords
                    .filter((record) => record.leagueID === 3)
                    .map((record) => (
                      <Link
                        key={`${record.indexID}-${record.leagueID}`}
                        className="!hover:no-underline mr-2 font-mont hover:text-blue600 focus:text-blue600"
                        target="_blank"
                        href={generateIndexLink(record)}
                      >
                        {`S${record.startSeason}`}
                      </Link>
                    ))}
                </Td>
              )}
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
};
