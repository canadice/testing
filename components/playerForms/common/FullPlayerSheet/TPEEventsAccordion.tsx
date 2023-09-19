import {
  Spinner,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import { TPEEventsTable } from 'components/common/tables/TPEEventsTable';
import { useTPEEvents } from 'hooks/useTPEEvents';
import { HTMLAttributes } from 'react';
import { TPEEvent } from 'typings';

export const TPEEventsAccordion = ({
  pid,
  borderStyle,
}: {
  pid: number;
  borderStyle: HTMLAttributes<HTMLDivElement>['style'];
}) => {
  const { tpeEvents, loading } = useTPEEvents(pid);

  return (
    <>
      {loading ? (
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
            >
              <span className="flex-1 text-left font-bold">TPE Events</span>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <TPEEventsTable data={tpeEvents as Array<TPEEvent>} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
