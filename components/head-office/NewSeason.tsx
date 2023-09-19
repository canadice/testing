import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  Checkbox,
  ListItem,
  UnorderedList,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { RegressionTable } from 'components/common/tables/RegressionTable';
import { useSession } from 'contexts/AuthContext';
import { ToastContext } from 'contexts/ToastContext';
import { useSeason } from 'hooks/useSeason';
import { useContext, useMemo, useState } from 'react';
import { Regression } from 'typings';
import { mutate, query } from 'utils/query';

import { SEASON_START_DELAY } from './constants';

export const NewSeason = () => {
  const { session } = useSession();
  const { season, startDate, ended: seasonEnded, loading } = useSeason();
  const { addToast } = useContext(ToastContext);
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasCheckedAcknowledge, setHasCheckedAcknowledge] = useState(false);

  const { data, isLoading } = useQuery<Regression[]>({
    queryKey: ['regressions', season],
    queryFn: () => query(`api/v1/player/regression?season=${season + 1}`),
    enabled: Boolean(season && season !== 0),
  });

  const newSeason = useMutation<
    // TODO: type return type
    unknown,
    unknown,
    // TODO: type variables a bit stricter
    Record<string, unknown>
  >({
    mutationFn: (variables) =>
      mutate('api/v1/season/advance', variables, {
        headers: {
          Authorization: `Bearer ${session?.token}`,
        },
      }),
  });

  const handleSubmit = async () => {
    setIsSubmitting(true);
    newSeason.mutate(
      {
        undo: seasonEnded,
      },
      {
        onError: () => {
          addToast({
            title: `Error`,
            description: seasonEnded
              ? 'Could not undo season end. Please try again.'
              : 'Could not advance season. Please try again.',
            status: 'error',
          });
        },
        onSuccess: () => {
          addToast({
            title: `Complete`,
            description: seasonEnded
              ? 'Disaster avoided. Please be more careful next time.'
              : 'Successfully processed changes and advanced to a new season.',
            status: 'success',
          });
          queryClient.invalidateQueries({
            queryKey: ['currentSeason'],
          });
          queryClient.invalidateQueries({
            queryKey: ['regressions'],
          });
        },
        onSettled: () => {
          setIsSubmitting(false);

          if (hasCheckedAcknowledge) setHasCheckedAcknowledge(false);
        },
      },
    );
  };

  const seasonAdvancement = useMemo(() => {
    if (startDate && !seasonEnded) {
      const currentDate = new Date();
      var fiveWeeksFromStartDate = new Date(startDate);
      fiveWeeksFromStartDate.setDate(
        fiveWeeksFromStartDate.getDate() + SEASON_START_DELAY,
      );

      return {
        enabled: currentDate > fiveWeeksFromStartDate,
        eligibleDate: fiveWeeksFromStartDate,
      };
    }
    return { enabled: false, eligibleDate: undefined };
  }, [seasonEnded, startDate]);

  return (
    <>
      {!loading && (
        <>
          <div className="flex justify-center text-center">
            {seasonEnded ? (
              <Button
                width="300px"
                height="300px"
                className="m-10 whitespace-normal"
                colorScheme="orange"
                isDisabled={isSubmitting || loading}
                isLoading={isSubmitting}
                rounded="full"
                style={{ fontSize: '50px' }}
                onClick={handleSubmit}
              >
                Oh No..
                <br />
                Go Back!
              </Button>
            ) : (
              <Button
                width="300px"
                height="300px"
                className="m-10 whitespace-normal"
                colorScheme={seasonAdvancement.enabled ? 'green' : 'red'}
                isDisabled={
                  !seasonAdvancement.enabled ||
                  !hasCheckedAcknowledge ||
                  loading ||
                  isSubmitting
                }
                isLoading={isSubmitting || loading}
                rounded="full"
                style={{ fontSize: '50px' }}
                onClick={handleSubmit}
              >
                Next
                <br />
                Season
              </Button>
            )}
          </div>

          {!seasonAdvancement.enabled ? (
            <Alert variant="subtle" status="error" className="mb-4">
              <AlertIcon />
              <AlertDescription>
                You cannot advance the season until after{' '}
                {seasonAdvancement.eligibleDate?.toDateString()}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert
              variant="subtle"
              status="success"
              className="mb-4"
              flexDirection="column"
              alignItems="left"
              justifyContent="left"
              textAlign="left"
            >
              <AlertTitle>
                To advance to the next season, please acknowledge the following:
              </AlertTitle>
              <AlertDescription>
                <br />
                <UnorderedList>
                  <ListItem>
                    I have validated the regression for affected players.
                  </ListItem>
                  <ListItem>
                    All relevant PT&apos;s for the current season (S{season})
                    have been entered.
                  </ListItem>
                </UnorderedList>
                <br />
                <Checkbox
                  isChecked={hasCheckedAcknowledge}
                  onChange={(e) => setHasCheckedAcknowledge(e.target.checked)}
                  borderColor="black"
                >
                  I acknowledge that regression is accurate and I wish to
                  proceed to the next season.
                </Checkbox>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
      <RegressionTable data={data ?? []} isLoading={isLoading} />
    </>
  );
};
