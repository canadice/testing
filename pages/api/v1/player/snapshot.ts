import { IIHF_COUNTRIES } from 'components/playerForms/constants';
import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL, { SQLStatement } from 'sql-template-strings';
import { PlayerSnap } from 'typings';
import {
  InternalPlayerInfo,
  InternalSkaterAttributes,
  InternalGoalieAttributes,
  InternalPlayerTaskStatus,
  InternalSeasons,
  InternalUserInfo,
  InternalTPECounts,
} from 'typings/portal-db';
import { leagueIdToName } from 'utils/leagueHelpers';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<PlayerSnap[]>,
): Promise<void> => {
  await use(req, res, cors);

  const {
    pid,
    uid,
    teamID,
    leagueID,
    notLeagueID,
    teamRightsID,
    status,
    notStatus,
    minSeason,
    maxSeason,
    taskStatus,
    draftSeason,
  } = req.query;

  const leagueName =
    leagueIdToName(
      parseInt(Array.isArray(leagueID) ? 'SHL' : leagueID ?? 'SHL'),
    )?.toUpperCase() ?? 'SHL';

  const notLeagueName =
    leagueIdToName(
      parseInt(Array.isArray(notLeagueID) ? 'SHL' : notLeagueID ?? 'SHL'),
    )?.toUpperCase() ?? 'SHL';

  let seasonStartDate = '';

  const seasonResponse = await query<InternalSeasons>(
    SQL`SELECT * FROM seasons ORDER BY season DESC LIMIT 1;`,
  );

  if (!('error' in seasonResponse || !seasonResponse.length)) {
    seasonStartDate = seasonResponse[0].startDate;
  }

  let seasonQuery: SQLStatement | boolean = false;

  const response = await query<
    InternalPlayerInfo &
    InternalPlayerTaskStatus &
    InternalUserInfo &
    InternalTPECounts & {
      attributes:
      | InternalSkaterAttributes
      | InternalGoalieAttributes
      | string;
    }
  >(
    SQL`SELECT player.userID, 
          player.playerUpdateID, 
          player.creationDate, 
          player.retirementDate, 
          player.status, 
          player.name, 
          player.position, 
          player.handedness, 
          player.recruiter, 
          player.render, 
          player.jerseyNumber, 
          player.height, 
          player.weight, 
          player.birthplace, 
          player.season, 
          player.currentLeague, 
          player.currentTeamID, 
          player.shlRightsTeamID, 
          player.iihfNation, 
          player.positionChanged, 
          player.usedRedistribution, 
          player.coachingPurchased, 
          player.teamTrainingCamp, 
          player.suspended, 
          player.totalTPE, 
          player.appliedTPE, 
          player.bankedTPE, 
          user.*, 
          task.status as taskStatus, 
          CASE
            WHEN player.position='Goalie' 
              THEN JSON_OBJECT(
                'blocker', player.g_blocker, 
                'glove', player.g_glove, 
                'passing', player.g_passing, 
                'pokeCheck', player.g_pokeCheck, 
                'positioning', player.g_positioning, 
                'rebound', player.g_rebound, 
                'recovery', player.g_recovery, 
                'puckhandling', player.g_puckhandling, 
                'lowShots', player.g_lowShots, 
                'reflexes', player.g_reflexes, 
                'skating', player.g_skating, 
                'aggression', player.g_aggression, 
                'mentalToughness', player.g_mentalToughness, 
                'determination', player.g_determination, 
                'teamPlayer', player.g_teamPlayer, 
                'leadership', player.g_leadership, 
                'goaltenderStamina', player.g_goaltenderStamina, 
                'professionalism', player.g_professionalism)
            ELSE JSON_OBJECT(
              'screening', player.s_screening, 
              'gettingOpen', player.s_gettingOpen, 
              'passing', player.s_passing, 
              'puckhandling', player.s_puckhandling, 
              'shootingAccuracy', player.s_shootingAccuracy, 
              'shootingRange', player.s_shootingRange, 
              'offensiveRead', player.s_offensiveRead, 
              'checking', player.s_checking, 
              'hitting', player.s_hitting, 
              'positioning', player.s_positioning, 
              'stickchecking', player.s_stickchecking, 
              'shotBlocking', player.s_shotBlocking, 
              'faceoffs', player.s_faceoffs, 
              'defensiveRead', player.s_defensiveRead, 
              'acceleration', player.s_acceleration, 
              'agility', player.s_agility, 
              'balance', player.s_balance, 
              'speed', player.s_speed, 
              'stamina', player.s_stamina, 
              'strength', player.s_strength, 
              'fighting', player.s_fighting, 
              'aggression', player.s_aggression, 
              'bravery', player.s_bravery, 
              'determination', player.s_determination, 
              'teamPlayer', player.s_teamPlayer, 
              'leadership', player.s_leadership, 
              'temperament', player.s_temperament, 
              'professionalism', player.s_professionalism)
            END AS attributes
          FROM playerSnapshot as player
        INNER JOIN userInfo as user ON player.userID = user.userID
        INNER JOIN playerTaskStatus as task ON player.playerUpdateID = task.playerUpdateID WHERE 1 `
      .append(pid != null ? SQL`AND player.playerUpdateID=${pid} ` : '')
      .append(uid != null ? SQL`AND player.userID=${uid} ` : '')
      .append(status != null ? SQL`AND player.status=${status} ` : '')
      .append(
        notStatus != null
          ? Array.isArray(notStatus)
            ? SQL`AND player.status NOT IN (${notStatus}) `
            : SQL`AND player.status!=${notStatus} `
          : '',
      )
      .append(draftSeason != null ? SQL`AND player.season=${draftSeason}` : '')
      .append(
        teamID != null && leagueID !== '2'
          ? teamID === 'ufa'
            ? SQL`AND player.currentTeamID IS NULL 
                  AND (player.retirementDate > ${seasonStartDate} OR player.retirementDate IS NULL) `
            : SQL`AND player.currentTeamID=${teamID} `
          : '',
      )
      .append(
        teamRightsID != null
          ? teamRightsID === 'none'
            ? SQL`AND player.shlRightsTeamID IS NULL `
            : SQL`AND player.shlRightsTeamID=${teamRightsID} `
          : '',
      )
      .append(
        leagueID != null
          ? leagueID !== '2'
            ? SQL`AND player.currentLeague=${leagueName} `
            : teamID != null && !Array.isArray(teamID)
              ? SQL`AND player.iihfNation=${IIHF_COUNTRIES[Number(teamID) as keyof typeof IIHF_COUNTRIES]
                }`
              : ''
          : '',
      )
      .append(
        notLeagueID != null
          ? SQL`AND !(player.currentLeague<=>${notLeagueName}) `
          : '',
      )
      .append(minSeason != null ? SQL`AND player.season>=${minSeason} ` : '')
      .append(maxSeason != null ? SQL`AND player.season<=${maxSeason} ` : '')

      .append(seasonQuery ? seasonQuery : '')
      .append(taskStatus != null ? `AND task.status=${taskStatus} ` : '')
      .append('ORDER BY player.playerUpdateID DESC'),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed = response.map((data) => ({
    uid: data.userID,
    username: data.username,
    pid: data.playerUpdateID,
    creationDate: data.creationDate,
    retirementDate: data.retirementDate,
    status: data.status,
    name: data.name,
    position: data.position,
    handedness: data.handedness,
    recruiter: data.recruiter,
    render: data.render,
    jerseyNumber: data.jerseyNumber,
    height: data.height,
    weight: data.weight,
    birthplace: data.birthplace,
    draftSeason: data.season,
    totalTPE: data.totalTPE,
    appliedTPE: data.appliedTPE,
    bankedTPE: data.bankedTPE,
    currentLeague: data.currentLeague,
    currentTeamID: data.currentTeamID,
    shlRightsTeamID: data.shlRightsTeamID,
    iihfNation: data.iihfNation,
    usedRedistribution: data.usedRedistribution,
    positionChanged: data.positionChanged,
    coachingPurchased: data.coachingPurchased,
    taskStatus: data.taskStatus,
    attributes: JSON.parse(data.attributes as string),
    isSuspended: data.suspended,
  }));

  res.status(200).json(parsed);
};
