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
  footedness: 'Left' | 'Right';
  recruiter: string | null;
  render: string | null;
  kitNumber: number | null;
  height: string | null;
  weight: number | null;
  birthplace: string | null;
  totalTPE: number;
  currentLeague: 'SSL' | 'Academy' | null;
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
  taskStatus: 'Academy Player' | 'SSL';
  attributes: OutfieldAttributes | KeeperAttributes;
};

export type KeeperAttributes = {
  acceleration: number;
  agility: number;
  balance: number;
  jumpingReach: number;
  naturalFitness: number;
  pace: number;
  stamina: number;
  strength: number;
  aggression: number;
  anticipation: number;
  bravery: number;
  composure: number;
  concentration: number;
  decisions: number;
  determination: number;
  flair: number;
  leadership: number;
  offTheBall: number;
  positioning: number;
  teamWork: number;
  vision: number;
  workRate: number;
  aerialReach: number;
  commandOfArea: number;
  communication: number;
  eccentricity: number;
  handling: number;
  kicking: number;
  oneOnOnes: number;
  reflexes: number;
  tendencyToRush: number;
  tendencyToPunch: number;
  throwing: number;
  firstTouch: number;
  freeKick: number;
  passing: number;
  penaltyTaking: number;
  technique: number;
};

export type OutfieldAttributes = {
  acceleration: number;
  agility: number;
  balance: number;
  jumpingReach: number;
  naturalFitness: number;
  pace: number;
  stamina: number;
  strength: number;
  aggression: number;
  anticipation: number;
  bravery: number;
  composure: number;
  concentration: number;
  decisions: number;
  determination: number;
  flair: number;
  leadership: number;
  offTheBall: number;
  positioning: number;
  teamWork: number;
  vision: number;
  workRate: number;
  corners: number;
  crossing: number;
  dribbling: number;
  finishing: number;
  firstTouch: number;
  freeKick: number;
  heading: number;
  longShots: number;
  longThrows: number;
  marking: number;
  passing: number;
  penaltyTaking: number;
  tackling: number;
  technique: number;
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

export type TeamManager = {
  leagueID: number;
  teamID: number;
  managerID: number;
  managerUsername: string;
  assmanID: number;
  assmanUsername: string;
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
