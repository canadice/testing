import {
  STARTING_TPE,
  SMJHL_ROOKIE_CAP,
  SMJHL_SOPHOMORE_CAP,
  LIMITED_ATTRIBUTES,
} from 'lib/constants';
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

const disabledSkaterAttributes = [
  'determination',
  'teamPlayer',
  'leadership',
  'temperament',
  'professionalism',
];

type EnabledGoalieAttributes = Omit<
  GoalieAttributes,
  | 'playerUpdateID'
  | 'aggression'
  | 'determination'
  | 'teamPlayer'
  | 'leadership'
  | 'professionalism'
>;

const disabledGoalieAttributes = [
  'aggression',
  'determination',
  'teamPlayer',
  'leadership',
  'professionalism',
];

export const isValidTPETransaction = async (
  info: Pick<Player, 'pid' | 'position'>,
  goalie?: EnabledGoalieAttributes,
  skater?: EnabledSkaterAttributes,
) => {
  const totalTPE = await getTotalTPE(info.pid);

  if (info.position === 'Goalie') {
    return (
      (await validateGoalieTPETransaction(
        goalie as EnabledGoalieAttributes,
        totalTPE,
      )) && isValidLimitedAttributes(info, goalie, skater)
    );
  } else {
    return (
      (await validateSkaterTPETransaction(
        skater as EnabledSkaterAttributes,
        totalTPE,
      )) && isValidLimitedAttributes(info, goalie, skater)
    );
  }
};

const validateSkaterTPETransaction = async (
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
      if (!disabledSkaterAttributes.includes(key)) {
        if (key === 'stamina') {
          spentTPE += scale[value]?.stamCost ?? 0;
        } else {
          spentTPE += scale[value]?.totalCost ?? 0;
        }
      }
    }

    return spentTPE <= totalTPE;
  } else {
    return false;
  }
};

const validateGoalieTPETransaction = async (
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
      if (!disabledGoalieAttributes.includes(key)) {
        spentTPE += scale[value]?.totalCost ?? 0;
      }
    }

    return spentTPE <= totalTPE;
  } else {
    return false;
  }
};

const getTotalTPE = async (pid: number) => {
  if (!pid) {
    return STARTING_TPE;
  }

  const response = await query<
    InternalPlayerInfo & InternalTPECounts
  >(SQL`SELECT * FROM playerInfo 
  INNER JOIN TPECounts on TPECounts.playerUpdateID = playerInfo.playerUpdateID
  WHERE playerInfo.playerUpdateID=${pid}`);

  const currentSeason = await query<{ season: number }>(
    SQL`SELECT * FROM seasons ORDER BY season DESC LIMIT 1;`,
  );

  if (
    !('error' in response) &&
    response.length > 0 &&
    !('error' in currentSeason) &&
    currentSeason.length > 0
  ) {
    if (!response[0]?.season || !response[0].currentLeague) {
      return response[0].totalTPE < SMJHL_ROOKIE_CAP
        ? response[0].totalTPE
        : SMJHL_ROOKIE_CAP;
    } else {
      if (response[0].currentLeague === 'SHL') {
        return response[0].totalTPE;
      } else {
        if (currentSeason[0].season <= response[0].season) {
          return response[0].totalTPE < SMJHL_ROOKIE_CAP
            ? response[0].totalTPE
            : SMJHL_ROOKIE_CAP;
        } else {
          return response[0].totalTPE < SMJHL_SOPHOMORE_CAP
            ? response[0].totalTPE
            : SMJHL_SOPHOMORE_CAP;
        }
      }
    }
  } else {
    return STARTING_TPE;
  }
};

export const isValidLimitedAttributes = (
  info: Pick<Player, 'pid' | 'position'>,
  goalie?: EnabledGoalieAttributes,
  skater?: EnabledSkaterAttributes,
) => {
  const attributes = info.position === 'Goalie' ? goalie : skater;

  const disabledAttributes =
    info.position === 'Goalie'
      ? disabledGoalieAttributes
      : disabledSkaterAttributes;

  let isValid = true;

  for (const [key, value] of Object.entries(attributes ?? {})) {
    if (
      !disabledAttributes.includes(key) &&
      LIMITED_ATTRIBUTES[key as keyof typeof LIMITED_ATTRIBUTES]
    ) {
      const positionsForLimitedAttribute =
        LIMITED_ATTRIBUTES[key as keyof typeof LIMITED_ATTRIBUTES]?.positions ??
        [];

      if ([...positionsForLimitedAttribute].includes(info.position)) {
        if (
          value > LIMITED_ATTRIBUTES[key as keyof typeof LIMITED_ATTRIBUTES].max
        ) {
          isValid = false;
        }
      }
    }
  }

  return isValid;
};
