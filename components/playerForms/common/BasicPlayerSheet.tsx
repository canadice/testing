import { Alert, AlertIcon } from '@chakra-ui/react';
import classnames from 'classnames';
import { startCase } from 'lodash';
import { PropsWithChildren, useMemo } from 'react';
import { Player, OutfieldAttributes, KeeperAttributes } from '../../../typings';

const excludedInfo = [
  'userID',
  'uid',
  'pid',
  'retirementDate',
  'creationDate',
  'status',
  'totalTPE',
  'season',
  'currentLeague',
  'currentTeamID',
  'shlRightsTeamID',
  'iihfNation',
  'appliedTPE',
  'bankedTPE',
  'draftSeason',
  // Ignored form values
  'goalie',
  'skater',
  'heightInches',
  'heightFeet',
  'usedRedistribution',
  'coachingPurchased',
  'trainingPurchased',
  'activityCheckComplete',
  'trainingCampComplete',
  'bankBalance',
  'taskStatus',
  'positionChanged',
  'attributes',
];

const CommonPlayerColumn = ({
  values,
  title,
}: {
  title: string;
  values: {
    name: string;
    value: string | number | boolean | null | undefined;
  }[];
}) => (
  <div className="flex flex-col divide-y divide-grey200">
    <div className="py-3 text-center font-mont text-xs font-semibold uppercase tracking-wider">
      {title}
    </div>
    {values.map(({ name, value }) => (
      <div
        key={name}
        className={classnames(
          title === 'Attributes' &&
          typeof value === 'number' &&
          value >= 15 &&
          'text-[color:red]',
          'flex items-center justify-between py-4 px-6 font-mont leading-5',
        )}
      >
        <div className="text-sm">{name}</div>
        <div>{value}</div>
      </div>
    ))}
  </div>
);

const BasicPlayerSheet = ({
  info,
  attributes,
  children,
}: PropsWithChildren<{
  info: Partial<Omit<Player, 'attributes'>>;
  attributes: Partial<OutfieldAttributes> | Partial<KeeperAttributes>;
}>) => {
  const [firstSet, secondSet] = useMemo(() => {
    const parsedAttributeData = Object.keys(attributes)
      .filter((key) => !excludedInfo.includes(key))
      .map((key) => ({
        name: startCase(key),
        value: attributes[key as keyof typeof attributes],
      }));
    const halfway = Math.floor(parsedAttributeData.length / 2);

    return [
      parsedAttributeData.slice(0, halfway),
      parsedAttributeData.slice(halfway, parsedAttributeData.length),
    ];
  }, [attributes]);

  const hasExcessiveStartingAttribute = useMemo(
    () =>
      firstSet.some((attribute) => Number(attribute.value ?? 0) >= 15) ||
      secondSet.some((attribute) => Number(attribute.value ?? 0) >= 15),
    [firstSet, secondSet],
  );

  const playerInfo = useMemo(
    () =>
      Object.keys(info)
        .filter((key) => !excludedInfo.includes(key))
        .map((key) => ({
          name: startCase(key),
          value: info[key as keyof typeof info],
        })),
    [info],
  );

  return (
    <>
      {hasExcessiveStartingAttribute ? (
        <Alert status="warning" className="mb-6">
          <AlertIcon />
          It&apos;s not recommended to have a starting attribute 15 or above.
          Some attibutes have been highlighted in red for you to review. You can
          still proceed with submitting if this is intended.
        </Alert>
      ) : (
        children
      )}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3">
        <CommonPlayerColumn values={playerInfo} title="Player Info" />
        <CommonPlayerColumn values={firstSet} title="Attributes" />
        <CommonPlayerColumn values={secondSet} title="Attributes" />
      </div>
    </>
  );
};

export default BasicPlayerSheet;
