import { AttributeChange } from 'components/playerForms/editAttributes/EditAttributesForm';
import { query } from 'lib/db';
import SQL from 'sql-template-strings';
import { Player } from 'typings';
import {
  InternalGoalieUpdateScale,
  InternalSkaterUpdateScale,
} from 'typings/portal-db';

export const getRedistributionTPE = async (
  info: Pick<Player, 'position'>,
  changes: AttributeChange[],
) => {
  if (info.position === 'Goalie') {
    return getGoalieRedistributionTPE(changes);
  } else {
    return getSkaterRedistributionTPE(changes);
  }
};

const getSkaterRedistributionTPE = async (changes: AttributeChange[]) => {
  const response = await query<InternalSkaterUpdateScale>(
    SQL`SELECT * FROM lookup_skaterUpdateScale;`,
  );

  if (!('error' in response)) {
    const scale: Record<
      string,
      Omit<
        InternalSkaterUpdateScale,
        'attributeValue' | 'stamCost' | 'totalCost'
      >
    > = {};

    response.map(
      (data) =>
        (scale[data.attributeValue] = {
          pointCost: data.pointCost,
        }),
    );

    return calculateTotalTPERefund({ changes, scale });
  } else {
    return false;
  }
};

const getGoalieRedistributionTPE = async (changes: AttributeChange[]) => {
  const response = await query<InternalGoalieUpdateScale>(
    SQL`SELECT * FROM lookup_goalieUpdateScale;`,
  );

  if (!('error' in response)) {
    const scale: Record<
      string,
      Omit<InternalGoalieUpdateScale, 'attributeValue' | 'totalCost'>
    > = {};

    response.map(
      (data) =>
        (scale[data.attributeValue] = {
          pointCost: data.pointCost,
        }),
    );

    return calculateTotalTPERefund({ changes, scale });
  } else {
    return false;
  }
};

const calculateTotalTPERefund = ({
  changes,
  scale,
}: {
  changes: AttributeChange[];
  scale: Record<string, { pointCost: number }>;
}) => {
  let redistributedTPE = 0;

  changes.map((change) => {
    const difference = change.oldValue - change.newValue;

    for (let i = 0; i < difference; i++) {
      redistributedTPE += scale[change.oldValue - i]?.pointCost ?? 0;
    }
  });

  return redistributedTPE;
};
