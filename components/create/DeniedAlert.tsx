import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Link,
} from '@chakra-ui/react';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { SHL_GENERAL_DISCORD } from 'lib/constants';
import DiscordLogo from 'public/discord.svg';

export const DeniedAlert = () => {
  const { status } = useCurrentPlayer();

  if (status !== 'denied') return null;

  return (
    <Alert
      status="warning"
      variant="top-accent"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
    >
      <AlertIcon />
      <AlertTitle>Your new player was denied.</AlertTitle>
      <AlertDescription fontSize="md" className="flex">
        <div>
          But don&apos;t worry! Our Rookie Mentors are on standby to help, as
          this is usually due to recommendations on your build. Once you know
          what needs to be adjusted, come back here and resubmit with your
          changes.
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            className="text-lg font-bold"
            href={SHL_GENERAL_DISCORD}
            target="_blank"
            isExternal
          >
            To follow-up on your submission, join our Discord.
            <div className="mt-2 flex justify-center">
              <DiscordLogo className="max-h-10" />
            </div>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
};
