// Utility type to get keys of object in object literal
type Keys<T> = T extends { [key: string]: any } ? keyof T : never;

export type TPEEvent = {
  submittedByID: number;
  submittedBy: string;
  pid: number;
  TPEChange: number;
  taskType: string;
  taskID: number;
  submissionDate: string;
  taskDescription: string;
  taskGroupID: number;
  playerName: string;
  taskThreadID?: number;
};

export type TPESubmission = {
  tempID: string;
  uid: number;
  username: string;
  playerName: string;
} & Pick<TPEEvent, 'pid' | 'TPEChange'>;

export type UpdateEvents = {
  eventID: number;
  playerUpdateID: number;
  attributeChanged: string;
  oldValue: string;
  newValue: string;
  eventDate: string;
  performedByID: number;
  performedBy: string;
  approvedByID?: number;
  approvedBy?: string;
  approvalDate?: string;
  status: 'pending' | 'denied' | 'approved' | 'NotRequired';
};

export type IndexPlayerID = {
  playerUpdateID: number;
  leagueID: number;
  indexID: number;
  startSeason: number;
};

export type Player = {
  uid: number;
  username: string;
  pid: number;
  creationDate: string;
  retirementDate: string | null;
  status: 'active' | 'pending' | 'retired' | 'denied';
  name: string;
  position:
    | 'Center'
    | 'Left Wing'
    | 'Right Wing'
    | 'Goalie'
    | 'Left Defense'
    | 'Right Defense';
  handedness: 'Left' | 'Right';
  recruiter: string | null;
  render: string | null;
  jerseyNumber: number | null;
  height: string | null;
  weight: number | null;
  birthplace: string | null;
  totalTPE: number;
  currentLeague: 'SMJHL' | 'SHL' | null;
  currentTeamID: number | null;
  shlRightsTeamID: number | null;
  iihfNation: string | null;
  draftSeason: number | null;
  bankedTPE: number;
  appliedTPE: number;
  positionChanged: boolean;
  usedRedistribution: number;
  coachingPurchased: number;
  trainingPurchased: boolean;
  activityCheckComplete: boolean;
  trainingCampComplete: boolean;
  bankBalance: number;
  taskStatus: 'Draftee Free Agent' | 'SMJHL Rookie' | 'SHL/Send-down';
  attributes: SkaterAttributes | GoalieAttributes;
  isSuspended: boolean;
  indexRecords: IndexPlayerID[] | null;
};

export type PlayerSnap = Omit<
  Player,
  | 'trainingPurchased'
  | 'activityCheckComplete'
  | 'trainingCampComplete'
  | 'bankBalance'
  | 'indexRecords'
>;

export type GoalieAttributes = {
  blocker: number;
  glove: number;
  passing: number;
  pokeCheck: number;
  positioning: number;
  rebound: number;
  recovery: number;
  puckhandling: number;
  lowShots: number;
  reflexes: number;
  skating: number;
  aggression: number;
  mentalToughness: number;
  determination: number;
  teamPlayer: number;
  leadership: number;
  goaltenderStamina: number;
  professionalism: number;
};

export type SkaterAttributes = {
  screening: number;
  gettingOpen: number;
  passing: number;
  puckhandling: number;
  shootingAccuracy: number;
  shootingRange: number;
  offensiveRead: number;
  checking: number;
  hitting: number;
  positioning: number;
  stickchecking: number;
  shotBlocking: number;
  faceoffs: number;
  defensiveRead: number;
  acceleration: number;
  agility: number;
  balance: number;
  speed: number;
  strength: number;
  stamina: number;
  fighting: number;
  aggression: number;
  bravery: number;
  determination: number;
  teamPlayer: number;
  leadership: number;
  temperament: number;
  professionalism: number;
};

export type Team = {
  id: number;
  season: number;
  league: number;
  conference: number;
  division: number;
  name: string;
  nameDetails: { first: string; second: string };
  abbreviation: string;
  location: string;
  colors: { primary: string; secondary: string; text: string };
  stats: {
    wins: number;
    losses: number;
    overtimeLosses: number;
    shootoutWins: number;
    shootoutLosses: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    winPercent: number;
  };
};

export type GeneralManager = {
  leagueID: number;
  teamID: number;
  gmID: number;
  gmUsername: string;
  cogmID: number;
  cogmUsername: string;
};

export type TPETimeline = {
  name: string;
  taskDate: string;
  totalTPE: number;
};

export type UserInfo = {
  userID: number;
  username: string;
};

export type LastWeekUpdates = {
  playerUpdateID: number;
  name: string;
  currentLeague: string;
  team_name: string;
  attributeChanged: string;
  oldValue: string;
  newValue: string;
  eventDate: string;
  status: string;
};

export type Seasons = {
  season: number;
  startDate: string;
  ended: boolean;
  discord: string;
  nextDiscord: string;
};

export type Regression = {
  uid: number;
  username: string;
  pid: number;
  name: string;
  draftSeason: numer;
  oldTPE: number;
  regressionPct: number;
  regressionTPE: number;
  newTPE: number;
};

export type BankTransactionTypes =
  | 'other'
  | 'transfer'
  | 'training'
  | 'seasonal coaching'
  | 'contract'
  | 'job pay'
  | 'media'
  | 'graphics grading'
  | 'chirper'
  | 'cards'
  | 'fantasy'
  | 'casino'
  | 'change';

export type BankTransaction = {
  id: number;
  uid: number;
  username: string;
  status: 'pending' | 'denied' | 'reversed' | 'completed';
  type: BankTransactionTypes;
  description?: string;
  amount: number;
  submitByID: number;
  submitBy: string;
  submitDate: string;
  approvedByID?: number;
  approvedBy?: string;
  approvedDate?: string;
  groupName?: string;
  groupID?: number;
  reversedByID?: number;
  reversedBy?: string;
  reversedDate?: string;
};

export type BankTransactionRecipientTypes = 'INDIVIDUAL' | 'GROUP';

export type BankTransactionSummary = {
  id: number;
  recipient: BankTransactionRecipientTypes;
  amount: number;
  name: string;
  type: BankTransactionTypes;
  submitBy: string;
  submitDate: string;
  status: 'pending' | 'denied' | 'reversed' | 'completed' | 'mixed';
  approvedBy?: string;
  approvedDate?: string;
  reversedBy?: string;
  reversedDate?: string;
};

export type DraftInfo = {
  playerUpdateID: number | null;
  playerName: string;
  userID: number | null;
  leagueID: number;
  seasonID: number;
  teamID: number;
  round: number;
  draftNumber: number;
};

export type PlayerAchievement = {
  playerUpdateID: number | null;
  playerName: string;
  userID: number | null;
  fhmID: number;
  leagueID: number;
  seasonID: number;
  teamID: number;
  achievement: number;
  achievementName: string;
  achievementDescription: string;
  isAward: boolean;
  won: boolean;
};

export type TeamAchievement = {
  teamID: number;
  leagueID: number;
  seasonID: number;
  achievement: number;
  achievementName: string;
  achievementDescription: string;
};
