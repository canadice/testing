import { userGroups } from './userGroups';

export const SHL_GENERAL_DISCORD = 'https://discord.com/invite/zwuQMxwsbZ';

export const CHANGE_COSTS = {
  name: 4_000_000,
  position: 8_000_000,
} as const;

export const TRAINING_COSTS = {
  rookie: {
    1: 100_000,
    2: 250_000,
    3: 500_000,
  },
  standard: {
    1: 100_000,
    3: 500_000,
    5: 1_000_000,
  },
} as const;

export const COACHING_COSTS = {
  rookie: 225_000,
  standard: 300_000,
} as const;

export const COACHING_MAX = {
  rookie: 20,
  standard: 28,
} as const;

export const STARTING_TPE = 155 as const;

export const SMJHL_ROOKIE_CAP = 350 as const;

export const SMJHL_SOPHOMORE_CAP = 425 as const;

export const MAX_ATTRIBUTE_COST = 55 as const;

export const MAX_REDISTRIBUTION_TPE = 80 as const;

export const REDISTRIBUTION_COSTS = {
  rookie: 0,
  standard: 100_000,
} as const;

export const EXCESSIVE_REGRESSION_THRESHOLD = 39 as const;

export const MAXIMUM_BANK_OVERDRAFT = -1_500_000 as const;

export const MAXIMUM_ATTRIBUTE = 20 as const;

export const LIMITED_ATTRIBUTES = {
  stamina: {
    min: 14,
    max: 20,
    positions: [
      'Center',
      'Left Wing',
      'Right Wing',
      'Left Defense',
      'Right Defense',
      'Goalie',
    ],
  },
  shootingRange: {
    min: 5,
    max: 12,
    positions: ['Center', 'Left Wing', 'Right Wing'],
  },
  shotBlocking: {
    min: 5,
    max: 12,
    positions: ['Center', 'Left Wing', 'Right Wing'],
  },
  shootingAccuracy: {
    min: 5,
    max: 13,
    positions: ['Left Defense', 'Right Defense'],
  },
} as const;

export const SKATER_ATTRIBUTE_COSTS = {
  5: { pointCost: 0, totalCost: 0, stamCost: 0 },
  6: { pointCost: 1, totalCost: 1, stamCost: 0 },
  7: { pointCost: 1, totalCost: 2, stamCost: 0 },
  8: { pointCost: 1, totalCost: 3, stamCost: 0 },
  9: { pointCost: 1, totalCost: 4, stamCost: 0 },
  10: { pointCost: 2, totalCost: 6, stamCost: 0 },
  11: { pointCost: 2, totalCost: 8, stamCost: 0 },
  12: { pointCost: 5, totalCost: 13, stamCost: 0 },
  13: { pointCost: 5, totalCost: 18, stamCost: 0 },
  14: { pointCost: 12, totalCost: 30, stamCost: 0 },
  15: { pointCost: 12, totalCost: 42, stamCost: 12 },
  16: { pointCost: 25, totalCost: 67, stamCost: 37 },
  17: { pointCost: 30, totalCost: 97, stamCost: 67 },
  18: { pointCost: 40, totalCost: 137, stamCost: 107 },
  19: { pointCost: 50, totalCost: 187, stamCost: 157 },
  20: { pointCost: 55, totalCost: 242, stamCost: 212 },
} as const;

export const GOALIE_ATTRIBUTE_COSTS = {
  5: { pointCost: 0, totalCost: 0 },
  6: { pointCost: 1, totalCost: 1 },
  7: { pointCost: 1, totalCost: 2 },
  8: { pointCost: 2, totalCost: 4 },
  9: { pointCost: 2, totalCost: 6 },
  10: { pointCost: 5, totalCost: 11 },
  11: { pointCost: 5, totalCost: 16 },
  12: { pointCost: 8, totalCost: 24 },
  13: { pointCost: 8, totalCost: 32 },
  14: { pointCost: 15, totalCost: 47 },
  15: { pointCost: 15, totalCost: 62 },
  16: { pointCost: 25, totalCost: 87 },
  17: { pointCost: 25, totalCost: 112 },
  18: { pointCost: 40, totalCost: 152 },
  19: { pointCost: 40, totalCost: 192 },
  20: { pointCost: 40, totalCost: 232 },
} as const;

export const BANK_TRANSACTION_TYPES = [
  'other',
  'transfer',
  'training',
  'seasonal coaching',
  'contract',
  'job pay',
  'media',
  'graphics grading',
  'chirper',
  'cards',
  'fantasy',
  'casino',
  'change',
] as const;

type RoleGroup = (keyof Readonly<typeof userGroups>)[];

export const CAN_START_NEXT_SEASON: RoleGroup = ['SHL_COMMISSIONER'];
export const CAN_ASSIGN_SHL_GM_ROLE: RoleGroup = ['SHL_COMMISSIONER', 'SHL_HO'];
export const CAN_ASSIGN_SMJHL_GM_ROLE: RoleGroup = [
  'SMJHL_COMMISSIONER',
  'SMJHL_HO',
];
export const CAN_APPROVE_PLAYERS: RoleGroup = [
  'SHL_COMMISSIONER',
  'SMJHL_COMMISSIONER',
  'SHL_HO',
  'SMJHL_HO',
  'SMJHL_INTERN',
];
export const CAN_ADJUST_PLAYER_TPE: RoleGroup = [
  'SHL_COMMISSIONER',
  'SMJHL_COMMISSIONER',
  'SHL_HO',
  'SMJHL_HO',
  'PT_GRADER',
  'SMJHL_INTERN',
];
export const CAN_HANDLE_PLAYER_REGRESSION: RoleGroup = ['SHL_GM'];
export const CAN_HANDLE_TEAM_TRANSACTIONS: RoleGroup = ['SHL_GM', 'SMJHL_GM'];
export const CAN_ASSIGN_PLAYER_IIHF_NATION: RoleGroup = [
  'IIHF_COMMISSIONER',
  'IIHF_HO',
];
export const CAN_PROCESS_BANK_TRANSACTIONS: RoleGroup = ['BANKER'];
export const CAN_VIEW_PENDING_PLAYERS: RoleGroup = [
  'SHL_COMMISSIONER',
  'SMJHL_COMMISSIONER',
  'IIHF_COMMISSIONER',
  'SHL_HO',
  'SMJHL_HO',
  'SMJHL_INTERN',
  'SHL_GM',
  'SMJHL_GM',
  'ROOKIE_MENTOR',
];
export const CAN_MANAGE_PLAYER_INDEX_IDS: RoleGroup = [
  'UPDATER',
  'HEAD_UPDATER',
];
