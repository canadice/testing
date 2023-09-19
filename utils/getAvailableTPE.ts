import { STARTING_TPE } from 'lib/constants';
import { query } from 'lib/db';
import SQL from 'sql-template-strings';
import { GoalieAttributes, Player, SkaterAttributes } from 'typings';
import {
  InternalGoalieUpdateScale,
  InternalPlayerInfo,
  InternalSkaterUpdateScale,
  InternalTPECounts,
} from 'typings/portal-db';

type EnabledSkaterAttributes = Omit<
  SkaterAttributes,
  | 'playerUpdateID'
  | 'determination'
  | 'teamPlayer'
  | 'leadership'
  | 'temperament'
  | 'professionalism'
>;
type EnabledGoalieAttributes = Omit<
  GoalieAttributes,
  | 'playerUpdateID'
  | 'aggression'
  | 'determination'
  | 'teamPlayer'
  | 'leadership'
  | 'professionalism'
>;

export const getAvailableTPE = async (
  info: Pick<Player, 'pid' | 'position'>,
  goalie?: EnabledGoalieAttributes,
  skater?: EnabledSkaterAttributes,
) => {
  let totalTPE = Number(STARTING_TPE);

  if (info.pid) {
    const response = await query<
      InternalPlayerInfo & InternalTPECounts
    >(SQL`SELECT * FROM playerInfo 
      INNER JOIN TPECounts ON TPECounts.playerUpdateID = playerInfo.playerUpdateID
      WHERE playerInfo.playerUpdateID=${info.pid}`);

    if (!('error' in response) && response.length >= 0) {
      totalTPE = response[0].totalTPE;
    }
  }

  if (info.position === 'Goalie') {
    return getAvailableGoalieTPE(goalie as EnabledGoalieAttributes, totalTPE);
  } else {
    return getAvailableSkaterTPE(skater as EnabledSkaterAttributes, totalTPE);
  }
};

const getAvailableSkaterTPE = async (
  skater: EnabledSkaterAttributes,
  totalTPE: number,
) => {
  const response = await query<InternalSkaterUpdateScale>(
    SQL`SELECT * FROM lookup_skaterUpdateScale;`,
  );

  if (!('error' in response)) {
    const scale: Record<
      string,
      Omit<InternalSkaterUpdateScale, 'attributeValue'>
    > = {};

    response.map(
      (data) =>
        (scale[data.attributeValue] = {
          pointCost: data.pointCost,
          totalCost: data.totalCost,
          stamCost: data.stamCost,
        }),
    );

    let spentTPE = 0;

    for (const [key, value] of Object.entries(skater)) {
      if (
        ![
          'determination',
          'teamPlayer',
          'leadership',
          'temperament',
          'professionalism',
        ].includes(key)
      ) {
        if (key === 'stamina') {
          spentTPE += scale[value]?.stamCost ?? 0;
        } else {
          spentTPE += scale[value]?.totalCost ?? 0;
        }
      }
    }

    return totalTPE - spentTPE;
  } else {
    return Infinity;
  }
};

const getAvailableGoalieTPE = async (
  goalie: EnabledGoalieAttributes,
  totalTPE: number,
) => {
  const response = await query<InternalGoalieUpdateScale>(
    SQL`SELECT * FROM lookup_goalieUpdateScale;`,
  );

  if (!('error' in response)) {
    const scale: Record<
      string,
      Omit<InternalGoalieUpdateScale, 'attributeValue'>
    > = {};

    response.map(
      (data) =>
        (scale[data.attributeValue] = {
          pointCost: data.pointCost,
          totalCost: data.totalCost,
        }),
    );

    let spentTPE = 0;

    for (const [key, value] of Object.entries(goalie)) {
      if (
        ![
          'aggression',
          'determination',
          'teamPlayer',
          'leadership',
          'professionalism',
        ].includes(key)
      ) {
        spentTPE += scale[value]?.totalCost ?? 0;
      }
    }

    return totalTPE - spentTPE;
  } else {
    return Infinity;
  }
};
