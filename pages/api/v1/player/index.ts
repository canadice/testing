import { IIHF_COUNTRIES } from 'components/playerForms/constants';
import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL, { SQLStatement } from 'sql-template-strings';
import { Player } from 'typings';
import {
  InternalBankBalance,
  InternalGoalieAttributes,
  InternalPlayerInfo,
  InternalPlayerTaskStatus,
  InternalSeasons,
  InternalSkaterAttributes,
  InternalTPECounts,
  InternalUserInfo,
  InternalWeeklyCounts,
} from 'typings/portal-db';
import { leagueIdToName } from 'utils/leagueHelpers';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<Player[]>,
): Promise<void> => {
  await use(req, res, cors);

  const {
    pid,
    uid,
    teamID,
    leagueID,
    teamRightsID,
    status,
    notStatus,
    minAppliedTPE,
    maxAppliedTPE,
    sendDownsForTeam,
    taskStatus,
    draftSeason,
  } = req.query;

  const leagueName =
    leagueIdToName(
      parseInt(Array.isArray(leagueID) ? 'SHL' : leagueID ?? 'SHL'),
    )?.toUpperCase() ?? 'SHL';

  let season = 0;

  const seasonResponse = await query<InternalSeasons>(
    SQL`SELECT season FROM seasons ORDER BY season DESC LIMIT 1;`,
  );

  if (!('error' in seasonResponse || !seasonResponse.length)) {
    season = seasonResponse[0].season;
  }

  let seasonQuery: SQLStatement | boolean = false;

  const response = await query<
    InternalPlayerInfo &
      InternalTPECounts &
      InternalBankBalance &
      InternalWeeklyCounts &
      InternalPlayerTaskStatus &
      InternalUserInfo & {
        attributes:
          | InternalSkaterAttributes
          | InternalGoalieAttributes
          | string;
      }
  >(
    SQL`SELECT player.*, tpe.*, bank.*, counts.*, user.*, task.status as taskStatus, 
          CASE
            WHEN player.position='Goalie' 
              THEN JSON_OBJECT(
                'blocker', goalie.blocker, 
                'glove', goalie.glove, 
                'passing', goalie.passing, 
                'pokeCheck', goalie.pokeCheck, 
                'positioning', goalie.positioning, 
                'rebound', goalie.rebound, 
                'recovery', goalie.recovery, 
                'puckhandling', goalie.puckhandling, 
                'lowShots', goalie.lowShots, 
                'reflexes', goalie.reflexes, 
                'skating', goalie.skating, 
                'aggression', goalie.aggression, 
                'mentalToughness', goalie.mentalToughness, 
                'determination', goalie.determination, 
                'teamPlayer', goalie.teamPlayer, 
                'leadership', goalie.leadership, 
                'goaltenderStamina', goalie.goaltenderStamina, 
                'professionalism', goalie.professionalism)
            ELSE JSON_OBJECT(
              'screening', skater.screening, 
              'gettingOpen', skater.gettingOpen, 
              'passing', skater.passing, 
              'puckhandling', skater.puckhandling, 
              'shootingAccuracy', skater.shootingAccuracy, 
              'shootingRange', skater.shootingRange, 
              'offensiveRead', skater.offensiveRead, 
              'checking', skater.checking, 
              'hitting', skater.hitting, 
              'positioning', skater.positioning, 
              'stickchecking', skater.stickchecking, 
              'shotBlocking', skater.shotBlocking, 
              'faceoffs', skater.faceoffs, 
              'defensiveRead', skater.defensiveRead, 
              'acceleration', skater.acceleration, 
              'agility', skater.agility, 
              'balance', skater.balance, 
              'speed', skater.speed, 
              'stamina', skater.stamina, 
              'strength', skater.strength, 
              'fighting', skater.fighting, 
              'aggression', skater.aggression, 
              'bravery', skater.bravery, 
              'determination', skater.determination, 
              'teamPlayer', skater.teamPlayer, 
              'leadership', skater.leadership, 
              'temperament', skater.temperament, 
              'professionalism', skater.professionalism)
            END AS attributes
          FROM playerInfo as player
        INNER JOIN bankBalance as bank ON player.userID = bank.uid
        INNER JOIN TPECounts as tpe ON player.playerUpdateID = tpe.playerUpdateID
        INNER JOIN weeklyCounts as counts ON player.playerUpdateID = counts.playerUpdateID
        INNER JOIN userInfo as user ON player.userID = user.userID
        INNER JOIN playerTaskStatus as task ON player.playerUpdateID = task.playerUpdateID
        LEFT JOIN goalieAttributes as goalie ON player.playerUpdateID = goalie.playerUpdateID
        LEFT JOIN skaterAttributes as skater ON player.playerUpdateID = skater.playerUpdateID WHERE 1 `
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
            ? SQL`AND player.currentTeamID IS NULL AND player.season!=${season} `
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
            ? SQL`AND player.iihfNation=${
                IIHF_COUNTRIES[Number(teamID) as keyof typeof IIHF_COUNTRIES]
              }`
            : ''
          : '',
      )
      .append(
        minAppliedTPE != null ? SQL`AND tpe.appliedTPE>=${minAppliedTPE} ` : '',
      )
      .append(
        maxAppliedTPE != null ? SQL`AND tpe.appliedTPE<=${maxAppliedTPE} ` : '',
      )
      .append(
        sendDownsForTeam != null
          ? SQL`AND player.currentLeague='SHL' AND player.currentTeamID=${sendDownsForTeam} AND tpe.appliedTPE<=350 AND player.season=${season} 
                OR player.currentLeague='SHL' AND player.currentTeamID=${sendDownsForTeam} AND tpe.appliedTPE<=425 AND player.season>=${
              season - 3
            } `
          : '',
      )
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
    totalTPE: data.totalTPE,
    appliedTPE: data.appliedTPE,
    bankedTPE: data.bankedTPE,
    draftSeason: data.season,
    currentLeague: data.currentLeague,
    currentTeamID: data.currentTeamID,
    shlRightsTeamID: data.shlRightsTeamID,
    iihfNation: data.iihfNation,
    usedRedistribution: data.usedRedistribution,
    positionChanged: data.positionChanged,
    coachingPurchased: data.coachingPurchased,
    trainingPurchased: Boolean(data.weeklyTraining > 0),
    activityCheckComplete: Boolean(data.weeklyActivityCheck > 0),
    trainingCampComplete: Boolean(data.teamTrainingCamp > 0),
    bankBalance: data.bankBalance,
    taskStatus: data.taskStatus,
    attributes: JSON.parse(data.attributes as string),
  }));

  res.status(200).json(parsed);
};
