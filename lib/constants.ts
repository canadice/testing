import { userGroups } from './userGroups';

export const SHL_GENERAL_DISCORD = 'https://discord.gg/QEHE67AaXQ';

export const CHANGE_COSTS = {
    name: 4_000_000,
    position: 5_000_000,
    render: 0,
    kitNumber: 0,
} as const;

export const TRAINING_COSTS = {
    standard: {
        1: 1_500_000,
        4: 3_000_000,
        8: 4_500_000,
        12: 5_500_000,
        18: 7_500_000,
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

export const STARTING_TPE = 350 as const;

export const EXCESSIVE_REGRESSION_THRESHOLD = 24 as const;

export const MAXIMUM_BANK_OVERDRAFT = 0 as const;

export const MAXIMUM_ATTRIBUTE = 20 as const;

// If we ever want to limit certain attributes by position
// export const LIMITED_ATTRIBUTES = {
//     stamina: {
//         min: 14,
//         max: 20,
//         positions: [
//             'Center',
//             'Left Wing',
//             'Right Wing',
//             'Left Defense',
//             'Right Defense',
//             'Goalie',
//         ],
//     },
//     shootingRange: {
//         min: 5,
//         max: 12,
//         positions: ['Center', 'Left Wing', 'Right Wing'],
//     },
//     shotBlocking: {
//         min: 5,
//         max: 12,
//         positions: ['Center', 'Left Wing', 'Right Wing'],
//     },
//     shootingAccuracy: {
//         min: 5,
//         max: 13,
//         positions: ['Left Defense', 'Right Defense'],
//     },
// } as const;

export const ATTRIBUTE_COSTS = {
    5: { pointCost: 0, totalCost: 0 },
    6: { pointCost: 2, totalCost: 2 },
    7: { pointCost: 2, totalCost: 4 },
    8: { pointCost: 4, totalCost: 8 },
    9: { pointCost: 4, totalCost: 12 },
    10: { pointCost: 4, totalCost: 16 },
    11: { pointCost: 6, totalCost: 22 },
    12: { pointCost: 6, totalCost: 28 },
    13: { pointCost: 6, totalCost: 34 },
    14: { pointCost: 12, totalCost: 46 },
    15: { pointCost: 12, totalCost: 58 },
    16: { pointCost: 12, totalCost: 70 },
    17: { pointCost: 18, totalCost: 88 },
    18: { pointCost: 18, totalCost: 106 },
    19: { pointCost: 25, totalCost: 131 },
    20: { pointCost: 25, totalCost: 156 },
} as const;

export const BANK_TRANSACTION_TYPES = [
    'other',
    'transfer',
    'training',
    'contract',
    'job pay',
    'career pt',
] as const;

type RoleGroup = (keyof Readonly<typeof userGroups>)[];

export const CAN_START_NEXT_SEASON: RoleGroup = ['SSL_COMMISSIONER'];
export const CAN_ASSIGN_MANAGER_ROLE: RoleGroup = ['SSL_COMMISSIONER', 'BOD'];
export const CAN_APPROVE_PLAYERS: RoleGroup = [
    'SSL_COMMISSIONER',
    'BOD',
    'BOD_INTERN',
];
export const CAN_ADJUST_PLAYER_TPE: RoleGroup = [
    'SSL_COMMISSIONER',
    'BOD',
    'BOD_INTERN',
    'PT_GRADER',
];
export const CAN_HANDLE_PLAYER_REGRESSION: RoleGroup = ['MANAGER'];
export const CAN_HANDLE_TEAM_TRANSACTIONS: RoleGroup = ['MANAGER'];
export const CAN_PROCESS_BANK_TRANSACTIONS: RoleGroup = ['BANKER'];
export const CAN_VIEW_PENDING_PLAYERS: RoleGroup = [
    'SSL_COMMISSIONER',
    'BOD',
    'BOD_INTERN',
    'MANAGER',
];