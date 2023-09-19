import {
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Spinner,
} from '@chakra-ui/react';
import classnames from 'classnames';
import { mapTimelineForChart } from 'components/playerForms/shared';
import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from 'recharts';
import { TPETimeline } from 'typings';

const seededHexColorCode = (str: string) => {
  let hash = 0;
  str.split('').forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let colour = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    colour += value.toString(16).padStart(2, '0');
  }
  return colour;
};

export const TPEChart = ({
  tpeTimelines,
  isLoading,
  tagCallback,
}: {
  tpeTimelines: TPETimeline[];
  isLoading?: boolean;
  tagCallback: (name: string) => void;
}) => {
  const [chartMap, setChartMap] = useState<
    | {
        data: {
          taskDate: string;
        }[];
        names: string[];
      }
    | undefined
  >(undefined);

  useEffect(() => {
    if (tpeTimelines?.length) {
      setChartMap(mapTimelineForChart(tpeTimelines));
    }
  }, [tpeTimelines]);

  const colorsArray = useMemo(() => {
    const colors: string[] = [];
    chartMap?.names.forEach((name) => colors.push(seededHexColorCode(name)));
    return colors;
  }, [chartMap?.names]);

  return (
    <div className="relative">
      <div
        className={classnames(
          'absolute h-auto w-full rounded-lg bg-grey700 transition-opacity',
          isLoading ? 'visible bg-opacity-10' : 'hidden bg-opacity-0',
        )}
        style={{ height: 400 }}
      >
        <Spinner
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform"
          size="xl"
        />
      </div>
      <ResponsiveContainer width="100%" height={400} className="my-4">
        <LineChart
          className="font-mont"
          data={chartMap?.data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="taskDate" />
          <YAxis />
          <Tooltip />
          {chartMap?.names.map((name, index) => (
            <Line
              key={name}
              type="monotone"
              connectNulls
              dataKey={name}
              stroke={colorsArray[index]}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
      <HStack spacing={4}>
        {chartMap?.names.map((name, index) => (
          <Tag
            size="sm"
            key={name}
            borderRadius="full"
            variant="solid"
            backgroundColor={colorsArray[index]}
          >
            <TagLabel>{name}</TagLabel>
            <TagCloseButton onClick={() => tagCallback(name)} />
          </Tag>
        ))}
      </HStack>
    </div>
  );
};
