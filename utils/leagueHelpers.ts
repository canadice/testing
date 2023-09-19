import { InternalLeague } from 'typings/portal-db';

const leagues = ['shl', 'smjhl', 'iihf'] as const;
export const leagueNameToId = (league: InternalLeague) =>
  leagues.indexOf(league);
export const leagueIdToName = (id: number): InternalLeague => leagues[id];

export const isMainLeague = (league: InternalLeague): boolean =>
  league === 'shl' || league === 'smjhl';
