import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { TeamAchievement } from 'typings';
import { InternalTeamAchievement } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TeamAchievement[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { season, teamID, leagueID } = req.query;

  if (teamID && !leagueID) {
    res
      .status(400)
      .end('Invalid request: leagueID required when querying by teamID');
    return;
  }

  const response = await query<
    InternalTeamAchievement & {
      achievementName: string;
      achievementDescription: string;
    }
  >(
    SQL`SELECT 
            teamAchievement.*,
            lookup_achievement.name as achievementName, 
            lookup_achievement.description as achievementDescription 
        FROM teamAchievement 
            LEFT JOIN lookup_achievement on teamAchievement.achievement = lookup_achievement.id
        WHERE 1 `
      .append(
        season !== undefined
          ? SQL`AND teamAchievement.seasonID=${season} `
          : '',
      )
      .append(
        teamID !== undefined ? SQL`AND teamAchievement.teamID=${teamID} ` : '',
      )
      .append(
        leagueID !== undefined
          ? SQL`AND teamAchievement.leagueID=${leagueID} `
          : '',
      )
      .append(`ORDER BY seasonID, achievement DESC`),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json(response);
};
