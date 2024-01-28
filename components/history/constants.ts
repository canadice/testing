import { Team } from 'typings';

export const FOUR_STAR_CUP_ID = 22;
export const CHALLENGE_CUP_ID = 17;
export const GOLD_MEDAL_ID = 50;
export const WINNING_ACHIEVEMENT_IDS = [
  FOUR_STAR_CUP_ID,
  CHALLENGE_CUP_ID,
  GOLD_MEDAL_ID,
];

export const DEFUNCT_TEAMS: Partial<Team>[] = [
  {
    id: 100,
    name: 'Seattle Stingray',
    league: 1,
    colors: { primary: '#666', secondary: '#666', text: '#FFF' },
  },
  {
    id: 101,
    name: 'Washington Patriots',
    league: 1,
    colors: { primary: '#666', secondary: '#666', text: '#FFF' },
  },
];
