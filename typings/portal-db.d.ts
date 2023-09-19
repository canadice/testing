// ? THIS FILE INCLUDES TYPES FOR ALL OF THE PORTAL TABLES. USE THESE TO DEFINE THE RETURN DATA FOR YOUR DB QUERIES.
// ? THE TYPESCRIPT `PICK<TYPE, KEYS>` MODIFIER CAN HELP ISOLATE INDIVIDUAL KEYS TO INCLUDE

export type InternalGeneralManagers = {
  leagueID: number;
  teamID: number;
  gmID: number;
  cogmID: number;
};

export type InternalGoalieAttributes = {
  playerUpdateID: number;
  blocker: number;
  glove: number;
  passing: number;
  pokeCheck: number;
  positioning: number;
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

export type InternalLeague = 'shl' | 'smjhl' | 'iihf';

export type InternalPlayerInfo = {
  userID: number;
  playerUpdateID: number;
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
  season: number | null;
  currentLeague: 'SMJHL' | 'SHL' | null;
  currentTeamID: number | null;
  shlRightsTeamID: number | null;
  iihfNation: string | null;
  positionChanged: boolean;
  usedRedistribution: number;
  coachingPurchased: number;
  teamTrainingCamp: number;
};

export type InternalSeasons = {
  season: number;
  startDate: string;
  ended: boolean;
  discord: string;
  nextDiscord: string;
};

export type InternalSkaterAttributes = {
  playerUpdateID: number;
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

export type InternalTPECounts = {
  playerUpdateID: number;
  appliedTPE: number;
  bankedTPE: number;
  totalTPE: number;
};

export type InternalTPEEvents = {
  userID: number;
  playerUpdateID: number;
  TPEChange: number;
  taskType: string;
  taskID: number;
  taskDate: string;
  taskDescription: string;
  taskGroupID: number;
  bankID: number;
  taskThreadID?: number;
};

export type InternalUpdateEvents = {
  eventID: number;
  playerUpdateID: number;
  attributeChanged: string;
  oldValue: string;
  newValue: string;
  eventDate: string;
  performedByID: number;
  status: 'pending' | 'denied' | 'approved' | 'NotRequired';
  approvedByID?: number;
  approvalDate?: string;
  bankID?: number;
};

export type InternalRegressionScale = {
  totalSeasons: number;
  regressionPct: number;
};

export type InternalGoalieUpdateScale = {
  attributeValue: string;
  pointCost: number;
  totalCost: number;
};

export type InternalSkaterUpdateScale = {
  stamCost: number;
} & InternalGoalieUpdateScale;

export type InternalUserSettings = {
  uid: number;
};

export type InternalBankTransactions = {
  id: number;
  uid: number;
  status: 'pending' | 'denied' | 'reversed' | 'completed';
  type:
    | 'other'
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
  description: string;
  amount: number;
  submitByID: number;
  submitDate: string;
  approvedByID: number;
  approvedDate: string;
  groupName: string;
  groupID: number;
  reversedByID: number;
  reversedDate: string;
};

export type InternalBankBalance = {
  uid: number;
  bankBalance: number;
};

export type InternalWeeklyCounts = {
  playerUpdateID: number;
  weeklyActivityCheck: number;
  weeklyTraining: number;
};

export type InternalUserInfo = {
  userID: number;
  username: string;
};

export type InternalPlayerTaskStatus = {
  playerUpdateID: number;
  taskStatus: 'Draftee Free Agent' | 'SMJHL Rookie' | 'SHL/Send-down';
};

export type InternalLastWeekUpdates = {
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
