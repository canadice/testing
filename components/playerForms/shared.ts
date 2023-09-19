import {
  FormikComputedProps,
  FormikHandlers,
  FormikHelpers,
  FormikState,
} from 'formik';
import { STARTING_TPE } from 'lib/constants';
import _ from 'lodash';
import {
  Player,
  GoalieAttributes,
  SkaterAttributes,
  TPETimeline,
} from 'typings';
import * as Yup from 'yup';

import { AttributeFormTypes } from './attributeForms/attributeFormFlags';
import {
  Country,
  Handedness,
  LimitedAttribute,
  PLAYER_INFO_OPTIONS,
  Position,
} from './constants';
import { AttributeChange } from './editAttributes/EditAttributesForm';

export const PLAYER_NAME_MAX_CHAR = 80;
export const RECRUITER_NAME_MAX_CHAR = 80;
export const RENDER_NAME_MAX_CHAR = 80;
// Since birthplace is a mix of city and country, leaving this lower than the actual DB value.
export const BIRTHPLACE_CITY_MAX_CHAR = 39;
export const BIRTHPLACE_COUNTRY_MAX_CHAR = 39;

export const MIN_PLAYER_HEIGHT_FT = 5;
export const MAX_PLAYER_HEIGHT_FT = 6;
export const MIN_PLAYER_HEIGHT_IN = 0;
export const MAX_PLAYER_HEIGHT_IN = 11;

export const MIN_PLAYER_WEIGHT = 150;
export const MAX_PLAYER_WEIGHT = 300;

const createPlayerErrorMessages = {
  name: {
    required: 'Please enter a name for your player.',
    min: 'Name must be at least 3 characters.',
    max: `Name must be at most ${PLAYER_NAME_MAX_CHAR} characters.`,
  },
  position: {
    required: 'Please choose a position for your player.',
    oneOf: 'Player position must be valid.',
  },
  handedness: {
    required: 'Please choose a handedness for your player.',
    oneOf: 'Player handedness must be Left or Right.',
  },
  recruiter: {
    max: `Recruiter cannot exceed ${RECRUITER_NAME_MAX_CHAR} characters.`,
  },
  render: {
    max: `Render cannot exceed ${RENDER_NAME_MAX_CHAR} characters.`,
  },
  jerseyNumber: {
    required: 'Please choose a jersey number for your player.',
  },
  height: {
    required: 'Please choose a height for your player.',
    missingFeet: 'Please select an option from the feet dropdown',
    missingInches: 'Please select an option from the inches dropdown',
  },
  weight: {
    min: `Player weight must be above ${MIN_PLAYER_WEIGHT}lbs`,
    max: `Player weight must be below ${MAX_PLAYER_WEIGHT}lbs`,
    required: 'Please choose a weight for your player.',
  },
  birthCountry: {
    max: `Player birthplace must be below ${BIRTHPLACE_COUNTRY_MAX_CHAR} characters`,
    required: 'Please choose a country for your player.',
  },
  customBirthCountry: {
    max: `Player birthplace must be below ${BIRTHPLACE_COUNTRY_MAX_CHAR} characters`,
    required: 'Please choose a country for your player.',
  },
  birthCity: {
    max: `Player birthplace must be below ${BIRTHPLACE_CITY_MAX_CHAR} characters`,
    required: 'Please choose a city for your player.',
  },
  availableTPE: {
    min: 'You have spent more TPE than you have available. Please adjust your build.',
    max: `You need to spend ${STARTING_TPE} TPE in order to fully create your player.`,
  },
};

const getPlayerAttributeSchema = ({
  attribute,
  min = 5,
  max = 20,
  limitedOptions,
}: {
  attribute: string;
  min?: number;
  max?: number;
  limitedOptions?: LimitedAttribute;
}) =>
  Yup.number()
    .required()
    .when('position', (position: Position) =>
      limitedOptions?.positions.includes(position)
        ? Yup.number()
            .min(
              limitedOptions.min,
              `Your player's ${attribute} must be at least ${limitedOptions.min}`,
            )
            .max(
              limitedOptions.max,
              `Your player's ${attribute} must be at most ${limitedOptions.max}`,
            )
        : Yup.number()
            .min(min, `Your player's ${attribute} must be at least ${min}`)
            .max(max, `Your player's ${attribute} must be at most ${max}`),
    );

const playerInfoValidationSchema = {
  name: Yup.string()
    .required(createPlayerErrorMessages.name.required)
    .min(3, createPlayerErrorMessages.name.min)
    .max(PLAYER_NAME_MAX_CHAR, createPlayerErrorMessages.name.max),
  position: Yup.mixed<Position>()
    .required(createPlayerErrorMessages.position.required)
    .oneOf(
      [...PLAYER_INFO_OPTIONS.POSITIONS],
      createPlayerErrorMessages.position.oneOf,
    ),
  handedness: Yup.mixed<Handedness>()
    .required(createPlayerErrorMessages.handedness.required)
    .oneOf(
      [...PLAYER_INFO_OPTIONS.HANDEDNESS],
      createPlayerErrorMessages.handedness.oneOf,
    ),
  recruiter: Yup.string()
    .optional()
    .max(RECRUITER_NAME_MAX_CHAR, createPlayerErrorMessages.recruiter.max),
  render: Yup.string()
    .optional()
    .max(RENDER_NAME_MAX_CHAR, createPlayerErrorMessages.render.max),
  jerseyNumber: Yup.number()
    .min(0)
    .max(99)
    .required(createPlayerErrorMessages.jerseyNumber.required),
  heightFeet: Yup.number().min(MIN_PLAYER_HEIGHT_FT).max(MAX_PLAYER_HEIGHT_FT),
  heightInches: Yup.number()
    .min(MIN_PLAYER_HEIGHT_IN)
    .max(MAX_PLAYER_HEIGHT_IN),
  height: Yup.string()
    .required(createPlayerErrorMessages.height.required)
    .matches(/^[1-9]ft.*$/, createPlayerErrorMessages.height.missingFeet)
    .matches(/^.*[0-9]in.*$/, createPlayerErrorMessages.height.missingInches),
  weight: Yup.number()
    .min(MIN_PLAYER_WEIGHT, createPlayerErrorMessages.weight.min)
    .max(MAX_PLAYER_WEIGHT, createPlayerErrorMessages.weight.max)
    .required(createPlayerErrorMessages.weight.required),
  birthCountry: Yup.mixed<Country>().oneOf([...PLAYER_INFO_OPTIONS.COUNTRIES]),
  customBirthCountry: Yup.string().when(
    'birthCountry',
    (birthCountry: Country) =>
      birthCountry === 'Other' || birthCountry === undefined
        ? Yup.string()
            .max(BIRTHPLACE_COUNTRY_MAX_CHAR)
            .required(createPlayerErrorMessages.customBirthCountry.required)
        : Yup.string(),
  ),
  birthCity: Yup.string()
    .max(BIRTHPLACE_CITY_MAX_CHAR)
    .required(createPlayerErrorMessages.birthCity.required),
  iihfNation: Yup.string().optional(),
};

const skaterValidationSchema = {
  skater: Yup.object({}).shape({
    screening: getPlayerAttributeSchema({
      attribute: 'screening',
    }),
    gettingOpen: getPlayerAttributeSchema({
      attribute: 'getting open',
    }),
    passing: getPlayerAttributeSchema({
      attribute: 'passing',
    }),
    puckhandling: getPlayerAttributeSchema({
      attribute: 'puckhandling',
    }),
    shootingAccuracy: getPlayerAttributeSchema({
      attribute: 'shooting accuracy',
      limitedOptions: {
        min: 5,
        max: 13,
        positions: ['Left Defense', 'Right Defense'],
      },
    }),
    shootingRange: getPlayerAttributeSchema({
      attribute: 'shooting range',
      limitedOptions: {
        min: 5,
        max: 12,
        positions: ['Center', 'Left Wing', 'Right Wing'],
      },
    }),
    offensiveRead: getPlayerAttributeSchema({
      attribute: 'offensive read',
    }),
    checking: getPlayerAttributeSchema({
      attribute: 'checking',
    }),
    hitting: getPlayerAttributeSchema({
      attribute: 'hitting',
    }),
    positioning: getPlayerAttributeSchema({
      attribute: 'positioning',
    }),
    stickchecking: getPlayerAttributeSchema({
      attribute: 'stickchecking',
    }),
    shotBlocking: getPlayerAttributeSchema({
      attribute: 'shotBlocking',
      limitedOptions: {
        min: 5,
        max: 12,
        positions: ['Center', 'Left Wing', 'Right Wing'],
      },
    }),
    faceoffs: getPlayerAttributeSchema({
      attribute: 'faceoffs',
    }),
    defensiveRead: getPlayerAttributeSchema({
      attribute: 'defensive read',
    }),
    acceleration: getPlayerAttributeSchema({
      attribute: 'acceleration',
    }),
    agility: getPlayerAttributeSchema({
      attribute: 'agility',
    }),
    balance: getPlayerAttributeSchema({
      attribute: 'balance',
    }),
    speed: getPlayerAttributeSchema({
      attribute: 'speed',
    }),
    stamina: getPlayerAttributeSchema({
      attribute: 'stamina',
      min: 14,
    }),
    strength: getPlayerAttributeSchema({
      attribute: 'strength',
    }),
    fighting: getPlayerAttributeSchema({
      attribute: 'fighting',
    }),
    aggression: getPlayerAttributeSchema({
      attribute: 'aggression',
    }),
    bravery: getPlayerAttributeSchema({
      attribute: 'bravery',
    }),
  }),
};

const goalieValidationSchema = {
  goalie: Yup.object({}).shape({
    blocker: getPlayerAttributeSchema({
      attribute: 'blocker',
    }),
    glove: getPlayerAttributeSchema({
      attribute: 'glove',
    }),
    passing: getPlayerAttributeSchema({
      attribute: 'passing',
    }),
    pokeCheck: getPlayerAttributeSchema({
      attribute: 'poke check',
    }),
    positioning: getPlayerAttributeSchema({
      attribute: 'positioning',
    }),
    rebound: getPlayerAttributeSchema({
      attribute: 'rebound',
    }),
    recovery: getPlayerAttributeSchema({
      attribute: 'recovery',
    }),
    puckhandling: getPlayerAttributeSchema({
      attribute: 'puckhandling',
    }),
    lowShots: getPlayerAttributeSchema({
      attribute: 'low shots',
    }),
    reflexes: getPlayerAttributeSchema({
      attribute: 'reflexes',
    }),
    skating: getPlayerAttributeSchema({
      attribute: 'skating',
    }),
    mentalToughness: getPlayerAttributeSchema({
      attribute: 'mental toughness',
    }),
    goaltenderStamina: getPlayerAttributeSchema({
      attribute: 'goaltender stamina',
    }),
  }),
};

export const createPlayerValidationSchema = Yup.object({}).shape({
  // Player info
  ...playerInfoValidationSchema,

  availableTPE: Yup.number()
    .min(0, createPlayerErrorMessages.availableTPE.min)
    .max(0, createPlayerErrorMessages.availableTPE.max),

  ...skaterValidationSchema,

  ...goalieValidationSchema,
});

export type CreatePlayerFormValidation = Yup.InferType<
  typeof createPlayerValidationSchema
>;

export const defaultPlayer: CreatePlayerFormValidation = {
  name: '',
  position: 'Center',
  handedness: 'Right',
  recruiter: '',
  render: '',
  jerseyNumber: 0,
  heightFeet: undefined,
  heightInches: undefined,
  weight: 200,
  customBirthCountry: '',
  birthCity: '',
  birthCountry: undefined,
  height: '',
  iihfNation: undefined,
  availableTPE: STARTING_TPE,
  goalie: {
    blocker: 5,
    glove: 5,
    passing: 5,
    pokeCheck: 5,
    positioning: 5,
    rebound: 5,
    recovery: 5,
    puckhandling: 5,
    lowShots: 5,
    reflexes: 5,
    skating: 5,
    mentalToughness: 5,
    goaltenderStamina: 5,
  },
  skater: {
    screening: 5,
    gettingOpen: 5,
    passing: 5,
    puckhandling: 5,
    shootingAccuracy: 5,
    shootingRange: 5,
    offensiveRead: 5,
    checking: 5,
    hitting: 5,
    positioning: 5,
    stickchecking: 5,
    shotBlocking: 5,
    faceoffs: 5,
    defensiveRead: 5,
    acceleration: 5,
    agility: 5,
    balance: 5,
    speed: 5,
    strength: 5,
    stamina: 14,
    fighting: 5,
    aggression: 5,
    bravery: 5,
  },
};

export const mapPlayerToFormValues = (
  player: Player,
): Yup.InferType<typeof createPlayerValidationSchema> => {
  const info = {
    name: player.name,
    position: player.position,
    handedness: player.handedness,
    recruiter: player.recruiter ?? '',
    render: player.render ?? '',
    jerseyNumber: player.jerseyNumber ?? 0,
    heightFeet: player.height
      ? Number(
          player.height.replace('ft', '').replace('in', '').split(' ')[0] ?? 5,
        )
      : undefined,
    heightInches: player.height
      ? Number(
          player.height.replace('ft', '').replace('in', '').split(' ')[1] ?? 0,
        )
      : undefined,
    weight: player.weight ?? 200,
    customBirthCountry: player.birthplace?.split(',').pop()?.trim(),
    birthCity: player.birthplace?.split(',')[0]?.trim() ?? '',
    birthCountry: 'Other' as Country,
    height: player.height ?? '',
    iihfNation: player.iihfNation ?? undefined,
    availableTPE: STARTING_TPE,
  };

  if (player.position === 'Goalie') {
    const attributes = player.attributes as GoalieAttributes;

    return {
      ...info,
      goalie: {
        blocker: attributes.blocker,
        glove: attributes.glove,
        passing: attributes.passing,
        pokeCheck: attributes.pokeCheck,
        positioning: attributes.positioning,
        rebound: attributes.rebound,
        recovery: attributes.recovery,
        puckhandling: attributes.puckhandling,
        lowShots: attributes.lowShots,
        reflexes: attributes.reflexes,
        skating: attributes.skating,
        mentalToughness: attributes.mentalToughness,
        goaltenderStamina: attributes.goaltenderStamina,
      },
      skater: {
        screening: 5,
        gettingOpen: 5,
        passing: 5,
        puckhandling: 5,
        shootingAccuracy: 5,
        shootingRange: 5,
        offensiveRead: 5,
        checking: 5,
        hitting: 5,
        positioning: 5,
        stickchecking: 5,
        shotBlocking: 5,
        faceoffs: 5,
        defensiveRead: 5,
        acceleration: 5,
        agility: 5,
        balance: 5,
        speed: 5,
        strength: 5,
        stamina: 14,
        fighting: 5,
        aggression: 5,
        bravery: 5,
      },
    };
  } else {
    const attributes = player.attributes as SkaterAttributes;

    return {
      ...info,
      goalie: {
        blocker: 5,
        glove: 5,
        passing: 5,
        pokeCheck: 5,
        positioning: 5,
        rebound: 5,
        recovery: 5,
        puckhandling: 5,
        lowShots: 5,
        reflexes: 5,
        skating: 5,
        mentalToughness: 5,
        goaltenderStamina: 5,
      },
      skater: {
        screening: attributes.screening,
        gettingOpen: attributes.gettingOpen,
        passing: attributes.passing,
        puckhandling: attributes.puckhandling,
        shootingAccuracy: attributes.shootingAccuracy,
        shootingRange: attributes.shootingRange,
        offensiveRead: attributes.offensiveRead,
        checking: attributes.checking,
        hitting: attributes.hitting,
        positioning: attributes.positioning,
        stickchecking: attributes.stickchecking,
        shotBlocking: attributes.shotBlocking,
        faceoffs: attributes.faceoffs,
        defensiveRead: attributes.defensiveRead,
        acceleration: attributes.acceleration,
        agility: attributes.agility,
        balance: attributes.balance,
        speed: attributes.speed,
        strength: attributes.strength,
        stamina: attributes.stamina,
        fighting: attributes.fighting,
        aggression: attributes.aggression,
        bravery: attributes.bravery,
      },
    };
  }
};

const editAttributesErrorMessages = {
  position: {
    required: 'Please choose a position for your player.',
    oneOf: 'Player position must be valid.',
  },
  availableTPE: {
    min: 'You have spent more TPE than you have available. Please adjust your build.',
    max: `You need to spend ${STARTING_TPE} TPE in order to fully create your player.`,
  },
};

export const editAttributesValidationSchema = Yup.object({}).shape({
  position: Yup.mixed<Position>()
    .required(editAttributesErrorMessages.position.required)
    .oneOf(
      [...PLAYER_INFO_OPTIONS.POSITIONS],
      editAttributesErrorMessages.position.oneOf,
    ),
  availableTPE: Yup.number()
    .min(0, editAttributesErrorMessages.availableTPE.min)
    .max(0, editAttributesErrorMessages.availableTPE.max),

  ...skaterValidationSchema,

  ...goalieValidationSchema,
});

export type EditAttributesFormValidation = Yup.InferType<
  typeof editAttributesValidationSchema
>;

export const editAttributesFormSchema = ({
  type,
}: {
  type: AttributeFormTypes;
}) => {
  const defaults = {
    position: Yup.mixed<Position>()
      .required(editAttributesErrorMessages.position.required)
      .oneOf(
        [...PLAYER_INFO_OPTIONS.POSITIONS],
        editAttributesErrorMessages.position.oneOf,
      ),

    ...skaterValidationSchema,

    ...goalieValidationSchema,
  };

  switch (type) {
    case 'Update':
    case 'Regression':
      return Yup.object().shape({
        ...defaults,
        availableTPE: Yup.number().min(
          0,
          'You must have a positive amount of TPE to proceed.',
        ),
      });
    case 'Create':
    case 'Redistribute':
      return Yup.object().shape({
        ...defaults,
      });
  }
};

export type CommonCreatePlayerFormProps = {
  errors: FormikState<CreatePlayerFormValidation>['errors'];
  touched: FormikState<CreatePlayerFormValidation>['touched'];
  values: FormikState<CreatePlayerFormValidation>['values'];
  isSubmitting: FormikState<CommonCreatePlayerFormProps>['isSubmitting'];
  isValid: FormikComputedProps<CommonCreatePlayerFormProps>['isValid'];
  initialValues: FormikComputedProps<CreatePlayerFormValidation>['initialValues'];
  handleBlur: FormikHandlers['handleBlur'];
  handleChange: FormikHandlers['handleChange'];
  handleSubmit: FormikHandlers['handleSubmit'];
  setFieldValue: FormikHelpers<CreatePlayerFormValidation>['setFieldValue'];
  resetForm: FormikHelpers<CreatePlayerFormValidation>['resetForm'];
};

export type CommonEditAttributesFormProps = {
  errors: FormikState<EditAttributesFormValidation>['errors'];
  touched: FormikState<EditAttributesFormValidation>['touched'];
  values: FormikState<EditAttributesFormValidation>['values'];
  isSubmitting: FormikState<CommonEditAttributesFormProps>['isSubmitting'];
  isValid: FormikComputedProps<CommonEditAttributesFormProps>['isValid'];
  initialValues: FormikComputedProps<EditAttributesFormValidation>['initialValues'];
  handleBlur: FormikHandlers['handleBlur'];
  handleChange: FormikHandlers['handleChange'];
  handleSubmit: FormikHandlers['handleSubmit'];
  setFieldValue: FormikHelpers<EditAttributesFormValidation>['setFieldValue'];
  resetForm: FormikHelpers<EditAttributesFormValidation>['resetForm'];
};

export const mapAttributeChanges = (
  initialValues: EditAttributesFormValidation,
  updatedValues: EditAttributesFormValidation,
  position?: Position,
): AttributeChange[] => {
  const isGoalie = position === 'Goalie';

  const changes = _.differenceWith(
    _.toPairs(isGoalie ? updatedValues.goalie : updatedValues.skater),
    _.toPairs(isGoalie ? initialValues.goalie : initialValues.skater),
    _.isEqual,
  );

  const attributeChanges: AttributeChange[] = changes.map((changedValues) => {
    const oldValue = isGoalie
      ? initialValues.goalie[
          changedValues[0] as keyof typeof initialValues.goalie
        ]
      : initialValues.skater[
          changedValues[0] as keyof typeof initialValues.skater
        ];

    return {
      attribute: changedValues[0],
      newValue: changedValues[1],
      oldValue: Number(oldValue),
    } as AttributeChange;
  });

  return attributeChanges;
};

export const mapTimelineForChart = (
  timelineData: TPETimeline[],
): {
  data: {
    taskDate: string;
  }[];
  names: string[];
} => {
  const formattedData = _.map(timelineData, (item) => ({
    ...item,
    taskDate: new Date(item.taskDate).toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }),
  }));

  const groupedData = _.groupBy(formattedData, 'taskDate');

  const uniqueTaskDates = _.uniqBy(formattedData, 'taskDate').map(
    (item) => item.taskDate,
  );

  const mappedData = _.map(uniqueTaskDates, (taskDate) => {
    const records = groupedData[taskDate];

    const playerUpdates = _.chain(records)
      .keyBy('name')
      .mapValues('totalTPE')
      .value();

    return {
      taskDate,
      ...playerUpdates,
    };
  });

  const uniqueNames = _.uniqBy(timelineData, 'name').map((item) => item.name);

  const sortedData = mappedData.sort(
    (a, b) => new Date(a.taskDate).getTime() - new Date(b.taskDate).getTime(),
  );

  return { data: sortedData, names: uniqueNames };
};
