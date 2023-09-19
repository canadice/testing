import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { TPEEvent } from 'typings';
import { InternalTPEEvents, InternalUserInfo } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TPEEvent[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { pid, uid, taskGroupID } = req.query;

  const response = await query<
    InternalTPEEvents & InternalUserInfo & { playerName: string }
  >(
    SQL`SELECT TPEEvents.*, user.*, player.name as playerName FROM TPEEvents
        INNER JOIN userInfo as user 
        ON TPEEvents.userID = user.userID
        LEFT JOIN playerInfo as player 
        ON player.playerUpdateID = TPEEvents.playerUpdateID WHERE 1 `
      .append(pid !== undefined ? SQL`AND player.playerUpdateID=${pid} ` : '')
      .append(uid !== undefined ? SQL`AND userID=${uid} ` : '')
      .append(
        taskGroupID !== undefined ? SQL`AND taskGroupID=${taskGroupID} ` : '',
      )
      .append(`ORDER BY taskID DESC`),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed: TPEEvent[] = response.map((data) => ({
    taskID: data.taskID,
    pid: data.playerUpdateID,
    submittedByID: data.userID,
    submittedBy: data.username,
    submissionDate: data.taskDate,
    taskType: data.taskType,
    TPEChange: data.TPEChange,
    taskDescription: data.taskDescription,
    taskGroupID: data.taskGroupID,
    playerName: data.playerName,
    taskThreadID: data.taskThreadID,
  }));

  res.status(200).json(parsed);
};
