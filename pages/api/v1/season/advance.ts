import { SEASON_START_DELAY } from 'components/headOffice/constants';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_START_NEXT_SEASON } from 'lib/constants';
import { query } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalSeasons } from 'typings/portal-db';

interface ExtendedRequest extends NextApiRequest {
  body: {
    undo: boolean;
  };
}

export default async function handler(
  req: ExtendedRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      validRoles: CAN_START_NEXT_SEASON,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  const season = req.body.undo
    ? await query<InternalSeasons>(
        SQL`SELECT * FROM seasons ORDER BY season DESC LIMIT 1;`,
      )
    : await query<InternalSeasons>(
        SQL`SELECT * FROM seasons WHERE ended=0 ORDER BY season DESC LIMIT 1;`,
      );

  if ('error' in season) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!season.length) {
    res.status(400).end('Invalid request');
    return;
  }

  var fiveWeeksFromStartDate = new Date(season[0].startDate);
  fiveWeeksFromStartDate.setDate(
    fiveWeeksFromStartDate.getDate() + SEASON_START_DELAY,
  );
  const currentDate = new Date();

  if (
    (!req.body.undo && currentDate < fiveWeeksFromStartDate) ||
    (req.body.undo && !season[0].ended)
  ) {
    res.status(400).end('Invalid request');
    return;
  }

  const results = req.body.undo
    ? await query(
        SQL`UPDATE seasons SET ended=0 WHERE season=${season[0].season};`,
      )
    : await query(
        SQL`UPDATE seasons SET ended=1 WHERE season=${season[0].season};`,
      );

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
