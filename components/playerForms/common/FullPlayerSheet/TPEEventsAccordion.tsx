import {
  Spinner,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { TPEEventsTable } from 'components/common/tables/TPEEventsTable';
import { HTMLAttributes } from 'react';
import { TPEEvent } from 'typings';
import { query } from 'utils/query';

export const TPEEventsAccordion = ({
  pid,
  borderStyle,
}: {
  pid: number;
  borderStyle: HTMLAttributes<HTMLDivElement>['style'];
}) => {
  const { data, isLoading } = useQuery<TPEEvent[]>({
    queryKey: ['tpeEvents', pid],
    queryFn: () => query(`api/v1/tpeevents?pid=${pid}`),
    enabled: pid !== undefined,
  });

  return (
    <>
      {isLoading ? (
        <div className="flex h-[100vh] w-full items-center justify-center">
          <Spinner size="xl" thickness="4px" />
        </div>
      ) : (
        <Accordion allowToggle>
          <AccordionItem>
            <AccordionButton
              className="bg-grey900 p-2 text-grey100"
              style={borderStyle}
              _hover={{}}
              padding="8px"
            >
              <span className="flex-1 text-left font-bold">TPE Events</span>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <TPEEventsTable data={data as Array<TPEEvent>} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
