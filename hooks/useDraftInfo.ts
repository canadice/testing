import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { DraftInfo } from 'typings';
import { isValidID } from 'utils/isValidID';
import { query } from 'utils/query';

export const useDraftInfo = ({
  playerUpdateID,
  userID,
  season,
  teamID,
  leagueID,
  enabled,
}: {
  playerUpdateID?: number;
  userID?: number;
  season?: number;
  teamID?: number;
  leagueID?: number;
  enabled: boolean;
}): {
  draftInfo: DraftInfo[];
  loading: boolean;
} => {
  const queryString = useMemo(() => {
    let queryStrings = [];

    if (isValidID(playerUpdateID)) {
      queryStrings.push(`pid=${playerUpdateID}`);
    }

    if (isValidID(userID)) {
      queryStrings.push(`uid=${userID}`);
    }

    if (season) {
      queryStrings.push(`season=${season}`);
    }

    if (isValidID(teamID)) {
      queryStrings.push(`teamID=${teamID}`);
    }

    if (isValidID(leagueID)) {
      queryStrings.push(`leagueID=${leagueID}`);
    }

    return queryStrings.join('&');
  }, [leagueID, playerUpdateID, season, teamID, userID]);

  const { data, isLoading } = useQuery<DraftInfo[]>({
    queryKey: ['draftInfo', queryString],
    queryFn: () => query(`api/v1/history/draft?${queryString}`),
    enabled: Boolean(queryString.length > 0 && enabled),
  });

  return {
    draftInfo: data ?? [],
    loading: isLoading,
  };
};
