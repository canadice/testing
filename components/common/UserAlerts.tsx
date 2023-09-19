import { Link, ListItem, UnorderedList } from '@chakra-ui/react';
import { useCurrentPlayer } from 'hooks/useCurrentPlayer';
import { useSeason } from 'hooks/useSeason';
import { useUpdateEvents } from 'hooks/useUpdateEvents';
import { startCase } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { UpdateEvents, Seasons } from 'typings';

import { DismissableAlert } from './DismissableAlert';

type EventAlert = UpdateEvents & { viewed: boolean };
type SeasonAlert = Seasons & { viewed: boolean };

export const storeEventAlerts = (updateEvents: UpdateEvents[]) => {
  const existingAlertsString = localStorage.getItem('eventAlerts');
  const existingAlerts: UpdateEvents[] = existingAlertsString
    ? JSON.parse(existingAlertsString)
    : [];

  const newAlerts = updateEvents.filter(
    (event) =>
      event.status === 'approved' &&
      event.approvalDate &&
      new Date(event.approvalDate) >
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
      !existingAlerts.some((existing) => existing.eventID === event.eventID),
  );

  const updatedAlerts = newAlerts.map((event) => ({
    ...event,
    viewed: false,
  }));

  if (updatedAlerts.length > 0) {
    const combinedAlerts = [...existingAlerts, ...updatedAlerts];
    localStorage.setItem('eventAlerts', JSON.stringify(combinedAlerts));
  }
};

export const setEventAlertViewed = (eventID: number) => {
  const existingAlertsString = localStorage.getItem('eventAlerts');
  const existingAlerts: EventAlert[] = existingAlertsString
    ? JSON.parse(existingAlertsString)
    : [];

  const updatedAlerts = existingAlerts.map((event) => {
    if (event.eventID === eventID) {
      return {
        ...event,
        viewed: true,
      };
    }
    return event;
  });

  localStorage.setItem('eventAlerts', JSON.stringify(updatedAlerts));
};

export const getEventAlerts = (): EventAlert[] => {
  const existingAlertsString = localStorage.getItem('eventAlerts');
  const existingAlerts: EventAlert[] = existingAlertsString
    ? JSON.parse(existingAlertsString)
    : [];

  const filteredAlerts = existingAlerts.filter((event) => !event.viewed);

  return filteredAlerts;
};

export const storeSeasonAlert = (season: Seasons) => {
  const existingAlertString = localStorage.getItem('seasonAlert');
  const existingAlert: Seasons = existingAlertString
    ? JSON.parse(existingAlertString)
    : undefined;

  const shouldUpdateSeasonAlert =
    season.startDate &&
    new Date(season.startDate) >
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
    season.season !== existingAlert?.season;

  if (shouldUpdateSeasonAlert) {
    localStorage.setItem(
      'seasonAlert',
      JSON.stringify({ ...season, viewed: false }),
    );
  }
};

export const setSeasonAlertViewed = () => {
  const existingAlertString = localStorage.getItem('seasonAlert');
  const existingAlert: SeasonAlert = existingAlertString
    ? JSON.parse(existingAlertString)
    : undefined;

  localStorage.setItem(
    'seasonAlert',
    JSON.stringify({ ...existingAlert, viewed: true }),
  );
};

export const getSeasonAlert = (): SeasonAlert | undefined => {
  const existingAlertString = localStorage.getItem('seasonAlert');
  const existingAlert: SeasonAlert = existingAlertString
    ? JSON.parse(existingAlertString)
    : undefined;

  return !existingAlert?.viewed ? existingAlert : undefined;
};

export const UserAlerts = () => {
  const { player, loading: playerLoading } = useCurrentPlayer();
  const { updateEvents, loading: updateEventsLoading } = useUpdateEvents(
    player?.pid,
  );
  const {
    season,
    startDate,
    ended,
    discord,
    nextDiscord,
    loading: seasonLoading,
  } = useSeason();

  const [eventAlerts, setEventAlerts] = useState<EventAlert[]>([]);
  const [seasonAlert, setSeasonAlert] = useState<SeasonAlert | undefined>(
    undefined,
  );

  useEffect(() => storeEventAlerts(updateEvents ?? []), [updateEvents]);

  useEffect(() => setEventAlerts(getEventAlerts()), [updateEvents]);

  useEffect(
    () => storeSeasonAlert({ season, startDate, ended, discord, nextDiscord }),
    [season, startDate, ended, discord, nextDiscord],
  );

  useEffect(() => setSeasonAlert(getSeasonAlert()), [season, startDate]);

  const dismissEventAlert = useCallback((eventID: number) => {
    setEventAlerts((prev) => prev.filter((alert) => alert.eventID !== eventID));
    setEventAlertViewed(eventID);
  }, []);

  const dismissSeasonAlert = useCallback(() => {
    setSeasonAlert(undefined);
    setSeasonAlertViewed();
  }, []);

  if (playerLoading || updateEventsLoading || seasonLoading) return null;

  return (
    <>
      {seasonAlert && (
        <DismissableAlert
          variant="subtle"
          status="success"
          className="mb-4"
          title={`Welcome to S${seasonAlert.season}!`}
          isOpen={true}
          onClose={() => dismissSeasonAlert()}
        >
          <div className="flex-col font-mont text-sm">
            <UnorderedList>
              <ListItem>Seasonal Coaching can now be purchased.</ListItem>
              <ListItem>Team Training Camp can now be completed.</ListItem>
              <ListItem>Redistribution usage has been reset.</ListItem>
            </UnorderedList>
          </div>
        </DismissableAlert>
      )}
      {eventAlerts.map((alert) => (
        <DismissableAlert
          key={alert.eventID}
          variant="subtle"
          status="success"
          className="mb-4"
          title={
            alert.attributeChanged === 'status' && alert.newValue === 'active'
              ? `Welcome to the SHL, ${player?.name}!`
              : `${startCase(alert.attributeChanged)} change has been approved`
          }
          isOpen={true}
          onClose={() => dismissEventAlert(alert.eventID)}
        >
          <div className="flex-col font-mont text-sm">
            {alert.attributeChanged === 'status' &&
            alert.newValue === 'active' ? (
              <UnorderedList>
                <ListItem>
                  Your newly created player has been approved!
                </ListItem>
                <ListItem>
                  We recommend new creates join the rookie Discord server, as it
                  will connect you with your draft class peers.
                </ListItem>
                <ListItem>
                  <Link
                    href={
                      player?.draftSeason === season + 1 ? discord : nextDiscord
                    }
                    isExternal
                  >
                    Click here to join your rookie class Discord!
                  </Link>
                </ListItem>
              </UnorderedList>
            ) : (
              <UnorderedList>
                <ListItem>
                  Your change request for{' '}
                  <span className="font-bold">
                    &apos;{alert.attributeChanged}&apos;
                  </span>{' '}
                  has been approved.
                </ListItem>
                <ListItem>
                  <span className="font-bold">Old Value:</span> {alert.oldValue}
                </ListItem>
                <ListItem>
                  <span className="font-bold">New Value:</span> {alert.newValue}
                </ListItem>
              </UnorderedList>
            )}
          </div>
        </DismissableAlert>
      ))}
    </>
  );
};
