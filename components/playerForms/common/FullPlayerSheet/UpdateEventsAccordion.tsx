import {
  Spinner,
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
} from '@chakra-ui/react';
import { UpdateEventsTable } from 'components/common/tables/UpdateEventsTable';
import { useUpdateEvents } from 'hooks/useUpdateEvents';
import { HTMLAttributes } from 'react';
import { UpdateEvents } from 'typings';

export const UpdateEventsAccordion = ({
  pid,
  borderStyle,
}: {
  pid: number;
  borderStyle: HTMLAttributes<HTMLDivElement>['style'];
}) => {
  const { updateEvents, loading } = useUpdateEvents(pid);

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
              padding="8px"
            >
              <span className="flex-1 text-left font-bold">Update Events</span>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel>
              <UpdateEventsTable data={updateEvents as Array<UpdateEvents>} />
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
};
