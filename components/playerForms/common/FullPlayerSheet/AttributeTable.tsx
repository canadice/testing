import { Table, TableContainer, Th, Thead, Tr } from '@chakra-ui/react';
import { MAXIMUM_ATTRIBUTE } from 'lib/constants';
import { startCase } from 'lodash';
import { useMemo } from 'react';
import { GoalieAttributes, SkaterAttributes } from 'typings';

export const AttributeTable = ({
  attributes,
  displayAttributes,
  header,
}: {
  attributes: SkaterAttributes | GoalieAttributes;
  displayAttributes: string[];
  header: string;
}) => {
  const parsedAttributeData = Object.keys(attributes)
    .filter((key) => displayAttributes.includes(key))
    .map((key) => ({
      name: startCase(key),
      value: attributes[key as keyof typeof attributes],
    }));

  return (
    <div className="text-sm">
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>{header}</Th>
            </Tr>
          </Thead>
        </Table>
      </TableContainer>
      {parsedAttributeData.map((attribute) => (
        <div
          key={attribute.name}
          className="relative flex min-h-[30px] items-center border-b-2 border-b-grey300"
        >
          <AttributeVisualizer attribute={attribute.value} />
          <div className="z-10 ml-4 flex items-center overflow-hidden">
            {attribute.name}
          </div>
          <div className="mr-4 flex-1 text-right font-mont">
            {attribute.value}
          </div>
        </div>
      ))}
    </div>
  );
};

const AttributeVisualizer = ({
  attribute,
}: {
  attribute: number | undefined;
}) => {
  const widthPercentage = useMemo(() => {
    if (!attribute) return 0;
    return (attribute / MAXIMUM_ATTRIBUTE) * 100;
  }, [attribute]);

  const backgroundColor = useMemo(() => {
    if (!attribute) return 'rgb(255,255,255)';

    if (attribute > 19) return 'rgb(28, 190, 237)';
    if (attribute > 17) return 'rgb(0, 165, 196)';
    if (attribute > 15) return 'rgb(0, 198, 162)';
    if (attribute > 13) return 'rgb(87, 206, 0)';
    if (attribute > 11) return 'rgb(180, 216, 0)';
    if (attribute > 9) return 'rgb(255, 220, 0)';
    if (attribute > 7) return 'rgb(250, 198, 0)';
    if (attribute > 5) return 'rgb(240, 122, 15)';

    return 'rgb(244,52,0)';
  }, [attribute]);

  return (
    <div
      className="absolute h-full opacity-50"
      style={{
        width: `${widthPercentage}%`,
        backgroundColor,
      }}
    />
  );
};
