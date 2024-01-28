import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { PlayerAchievement } from 'typings';
import { InternalPlayerAchievement } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<PlayerAchievement[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { pid, uid, season, teamID, leagueID, achievementID, fhmID } =
    req.query;

  if ((teamID || achievementID || fhmID) && !leagueID) {
    res
      .status(400)
      .end('Invalid request: a leagueID is required with this query');
    return;
  }

  const response = await query<
    InternalPlayerAchievement & {
      achievementName: string;
      achievementDescription: string;
      playerName: string;
      indexName: string;
      userName: string;
    }
  >(
    SQL`SELECT 
            playerAchievement.*,
            lookup_achievement.name as achievementName, 
            lookup_achievement.description as achievementDescription, 
            playerInfo.name as playerName, 
            getFHMID.Name as indexName,
            userInfo.username as userName
        FROM playerAchievement 
            LEFT JOIN lookup_achievement on playerAchievement.achievement = lookup_achievement.id
            LEFT JOIN playerInfo on playerInfo.playerUpdateID = playerAchievement.playerUpdateID 
            LEFT JOIN getFHMID on playerAchievement.fhmID = getFHMID.FHMID 
              AND playerAchievement.leagueID = getFHMID.leagueID
              AND playerAchievement.seasonID = getFHMID.seasonID
            LEFT JOIN userInfo on playerAchievement.uid = userInfo.userID 
        WHERE 1 `
      .append(
        pid !== undefined
          ? SQL`AND playerAchievement.playerUpdateID=${pid} `
          : '',
      )
      .append(uid !== undefined ? SQL`AND playerAchievement.uid=${uid} ` : '')
      .append(
        season !== undefined
          ? SQL`AND playerAchievement.seasonID=${season} `
          : '',
      )
      .append(
        teamID !== undefined
          ? SQL`AND playerAchievement.teamID=${teamID} `
          : '',
      )
      .append(
        leagueID !== undefined
          ? SQL`AND playerAchievement.leagueID=${leagueID} `
          : '',
      )
      .append(
        achievementID !== undefined
          ? SQL`AND playerAchievement.achievement=${achievementID} `
          : '',
      )
      .append(
        fhmID !== undefined ? SQL`AND playerAchievement.fhmID=${fhmID} ` : '',
      )
      .append(`ORDER BY seasonID DESC, achievement, type, awarded ASC`),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed: PlayerAchievement[] = response.map((data) => ({
    playerUpdateID: data.playerUpdateID,
    playerName: data.playerName ?? data.indexName ?? data.userName,
    userID: data.uid,
    fhmID: data.FHMID,
    leagueID: data.leagueID,
    seasonID: data.seasonID,
    teamID: data.teamID,
    achievement: data.achievement,
    achievementName: data.achievementName,
    achievementDescription: data.achievementDescription,
    isAward: Boolean(data.type),
    won: Boolean(data.awarded ?? true),
  }));

  res.status(200).json(parsed);
};
