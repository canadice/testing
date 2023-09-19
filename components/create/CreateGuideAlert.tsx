import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Card,
  Stack,
  CardBody,
  Heading,
  CardFooter,
  Button,
  Text,
  Collapse,
  Link,
} from '@chakra-ui/react';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useState } from 'react';

const WRITTEN_PT1_LINK =
  'https://simulationhockey.com/showthread.php?tid=132807';
const WRITTEN_PT2_LINK =
  'https://simulationhockey.com/showthread.php?tid=132811';

const VIDEO_PT1_LINK =
  'https://www.youtube.com/embed/tO2DDbtg41I?si=ISCuRisszFx2XRtH';
const VIDEO_PT2_LINK =
  'https://www.youtube.com/embed/oNDn-a6yPKY?si=ML7qZ9wcqJW6akIF';

export const CreateGuideAlert = () => {
  const [shouldShowCard, setShouldShowCard] = useState(true);
  const [shouldShowGuides, setShouldShowGuides] = useState(false);
  const { status } = useCurrentPlayer();

  if (!shouldShowCard || status === 'denied') return null;

  return (
    <Card size="sm" variant="outline">
      <Stack>
        <CardBody>
          {!shouldShowGuides && (
            <>
              <Heading size="md">Are you new here?</Heading>
              <Text py="2">
                We have both a written guide and a video walkthrough of our
                player creation process, as well as important next steps to make
                sure that you&apos;re not missing out on anything as a newly
                created player. Would you like more information?
              </Text>
            </>
          )}
          <Collapse in={shouldShowGuides} animateOpacity>
            <div className="grid grid-cols-[repeat(auto-fit,_minmax(400px,_1fr))] gap-2">
              <div className="flex-col space-y-6">
                <Heading as="h3" size="lg">
                  Creating Your Player
                </Heading>
                <div className="relative h-0 w-full pb-[56.25%]">
                  <iframe
                    className="absolute top-0 left-0 h-full w-full"
                    src={VIDEO_PT1_LINK}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <Link
                  isExternal
                  href={WRITTEN_PT1_LINK}
                  className="hover:text-blue600"
                >
                  <ExternalLinkIcon className="mr-2" />
                  Prefer a written guide? Here&apos;s Part One..
                </Link>
              </div>
              <div className="flex-col space-y-6">
                <Heading as="h3" size="lg">
                  Updating and Weekly Activities
                </Heading>
                <div className="relative h-0 w-full pb-[56.25%]">
                  <iframe
                    className="absolute top-0 left-0 h-full w-full"
                    src={VIDEO_PT2_LINK}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  ></iframe>
                </div>
                <Link
                  isExternal
                  href={WRITTEN_PT2_LINK}
                  className="hover:text-blue600"
                >
                  <ExternalLinkIcon className="mr-2" />
                  Prefer a written guide? Here&apos;s Part Two..
                </Link>
              </div>
            </div>
          </Collapse>
        </CardBody>

        <CardFooter className="flex justify-center gap-3 text-center">
          {!shouldShowGuides && (
            <Button
              variant="solid"
              colorScheme="blue"
              onClick={() => setShouldShowGuides(true)}
            >
              Sure
            </Button>
          )}
          <Button
            variant="solid"
            colorScheme="red"
            onClick={() => setShouldShowCard(false)}
          >
            {shouldShowGuides ? "I'm all set!" : 'No Thanks'}
          </Button>
        </CardFooter>
      </Stack>
    </Card>
  );
};
