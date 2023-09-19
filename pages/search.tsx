import {
  Collapse,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { PermissionGuard } from 'components/auth/PermissionGuard';
import { PageHeading } from 'components/common/PageHeading';
import { PageWrapper } from 'components/common/PageWrapper';
import { PlayerTable } from 'components/common/tables/PlayerTable';
import { TPEChart } from 'components/tpe/TPEChart';
import { useRouterPageState } from 'hooks/useRouterPageState';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Player, TPETimeline } from 'typings';
import { query } from 'utils/query';

export default () => {
  const {
    league: selectedLeague,
    status,
    draftSeason,
    setRouterPageState,
  } = useRouterPageState<{
    league: '0' | '1' | undefined;
    status: 'active' | 'retired' | 'pending' | undefined;
    draftSeason: number | undefined;
  }>({
    keys: ['league', 'status', 'draftSeason'],
  });

  const queryString = useMemo(() => {
    return Object.entries({ selectedLeague, status, draftSeason })
      .filter(([, value]) => !!value)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }, [draftSeason, selectedLeague, status]);

  const { data, isLoading } = useQuery<Player[]>({
    queryKey: ['searchPlayers', queryString],
    queryFn: () =>
      query(
        `api/v1/player?${queryString}${
          queryString.includes('status=pending') ? '' : '&notStatus=pending'
        }&notStatus=denied`,
      ),
  });

  useEffect(() => {
    if (!isLoading && draftSeason === 0) {
      setRouterPageState('draftSeason', undefined);
    }
  }, [draftSeason, isLoading, setRouterPageState]);

  const [comparisonPlayers, setComparisonPlayers] = useState<Player[]>([]);

  const playerComparisonQuery = useMemo(
    () => comparisonPlayers.map((player) => `pid=${player.pid}`).join('&'),
    [comparisonPlayers],
  );

  const { data: timelineData, isLoading: isTimelineLoading } = useQuery<
    TPETimeline[]
  >({
    queryKey: ['tpeTimeline', playerComparisonQuery],
    queryFn: () =>
      query(`/api/v1/tpeevents/timeline?${playerComparisonQuery}`, {
        headers: {},
      }),
    enabled: comparisonPlayers.length > 0,
  });

  const addComparisonPlayer = useCallback(
    (player: Player) => setComparisonPlayers((prev) => [...prev, player]),
    [],
  );

  const removeComparisonPlayer = useCallback(
    (playerName: string) =>
      setComparisonPlayers((prev) =>
        prev.filter((player) => player.name !== playerName),
      ),
    [],
  );

  return (
    <PageWrapper title="Search" className="flex flex-col">
      <PageHeading className="mb-4">Player Search</PageHeading>
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-6 py-2 pb-6">
        <div>
          <FormLabel>League</FormLabel>
          <RadioGroup
            onChange={(newValue) =>
              setRouterPageState(
                'league',
                newValue === 'default'
                  ? undefined
                  : (newValue as typeof selectedLeague),
              )
            }
            value={selectedLeague ?? 'default'}
          >
            <Stack direction="row">
              <Radio value="default">All</Radio>
              <Radio value="0">SHL</Radio>
              <Radio value="1">SMJHL</Radio>
            </Stack>
          </RadioGroup>
        </div>
        <div>
          <FormLabel>Status</FormLabel>
          <RadioGroup
            onChange={(newValue) =>
              setRouterPageState(
                'status',
                newValue === 'default'
                  ? undefined
                  : (newValue as typeof status),
              )
            }
            value={status ?? 'default'}
          >
            <Stack direction="row">
              <Radio value="default">All</Radio>
              <Radio value="active">Active</Radio>
              <Radio value="retired">Retired</Radio>
              <PermissionGuard userPermissions="canViewPendingPlayers">
                <Radio value="pending">Pending</Radio>
              </PermissionGuard>
            </Stack>
          </RadioGroup>
        </div>
        <FormControl>
          <FormLabel>Draft Season</FormLabel>
          <Input
            type="number"
            value={draftSeason}
            className="font-mont"
            min={0}
            onChange={(e) =>
              setRouterPageState(
                'draftSeason',
                isNaN(parseInt(e.target.value, 10))
                  ? undefined
                  : parseInt(e.target.value, 10),
              )
            }
          />
        </FormControl>
      </div>
      <div className="flex w-full flex-col">
        <PlayerTable
          data={data ?? []}
          isLoading={isLoading}
          actionConfig={{
            action: 'Compare',
            callback: addComparisonPlayer,
          }}
        />
      </div>
      <div>
        <Collapse in={comparisonPlayers.length > 0} animateOpacity>
          <>
            <div className="mt-4 bg-grey900 p-2 text-grey100">
              <div className="flex justify-between font-bold">
                <span>TPE Comparison</span>
              </div>
            </div>
            <TPEChart
              tpeTimelines={timelineData ?? []}
              isLoading={isTimelineLoading}
              tagCallback={removeComparisonPlayer}
            />
          </>
        </Collapse>
      </div>
    </PageWrapper>
  );
};
