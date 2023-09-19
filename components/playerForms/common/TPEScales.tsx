import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Thead,
  Th,
  Tr,
} from '@chakra-ui/react';

const TPETableWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <TableContainer minW="100%" marginBottom="16px">
      <Table>{children}</Table>
    </TableContainer>
  );
};

export const GoalieTpeScale = () => {
  return (
    <TPETableWrapper>
      <Thead>
        <Tr>
          <Th>Rating</Th>
          <Th>6-7</Th>
          <Th>8-9</Th>
          <Th>10-11</Th>
          <Th>12-13</Th>
          <Th>14-15</Th>
          <Th>16-17</Th>
          <Th>18-20</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>TPE Cost</Td>
          <Td>1</Td>
          <Td>2</Td>
          <Td>5</Td>
          <Td>8</Td>
          <Td>15</Td>
          <Td>25</Td>
          <Td>40</Td>
        </Tr>
      </Tbody>
    </TPETableWrapper>
  );
};

export const SkaterTpeScale = () => {
  return (
    <TPETableWrapper>
      <Thead>
        <Tr>
          <Th>Rating</Th>
          <Th>6-9</Th>
          <Th>10-11</Th>
          <Th>12-13</Th>
          <Th>14-15</Th>
          <Th>16</Th>
          <Th>17</Th>
          <Th>18</Th>
          <Th>19</Th>
          <Th>20</Th>
        </Tr>
      </Thead>
      <Tbody>
        <Tr>
          <Td>TPE Cost</Td>
          <Td>1</Td>
          <Td>2</Td>
          <Td>5</Td>
          <Td>12</Td>
          <Td>25</Td>
          <Td>30</Td>
          <Td>40</Td>
          <Td>50</Td>
          <Td>55</Td>
        </Tr>
      </Tbody>
    </TPETableWrapper>
  );
};
