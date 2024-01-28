import {
  PlayerTaskStatus,
  PLAYER_TASK_STATUSES,
} from 'components/playerForms/constants';
import { checkUserAuthorization } from 'lib/checkUserAuthorization';
import { CAN_ADJUST_PLAYER_TPE } from 'lib/constants';
import { endTransaction, query, transaction } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { TPEEvent } from 'typings';
import {
  InternalPlayerInfo,
  InternalPlayerTaskStatus,
  InternalUserInfo,
} from 'typings/portal-db';

interface TPEEventCreateNextApiRequest extends NextApiRequest {
  body: {
    taskStatus: PlayerTaskStatus;
    events: TPEEvent[];
  };
}

export default async function handler(
  req: TPEEventCreateNextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  if (
    !(await checkUserAuthorization(req, {
      validRoles: CAN_ADJUST_PLAYER_TPE,
    }))
  ) {
    res.status(401).end(`Not authorized`);
    return;
  }

  if (!PLAYER_TASK_STATUSES.includes(req.body.taskStatus)) {
    res.status(400).end('Invalid request');
    return;
  }

  const playerUpdateIDs = req.body.events.map((event) => event.pid);

  const players = await query<
    InternalPlayerInfo & InternalPlayerTaskStatus & InternalUserInfo
  >(
    SQL`SELECT player.*, user.*, task.*, task.status as taskStatus
        FROM playerInfo as player
        INNER JOIN playerTaskStatus as task 
        ON player.playerUpdateID = task.playerUpdateID
        INNER JOIN userInfo as user 
        ON player.userID = user.userID
        WHERE player.playerUpdateID IN (${playerUpdateIDs})`,
  );

  if ('error' in players) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!players.length) {
    res.status(400).end('Invalid request');
    return;
  }

  if (req.body.taskStatus !== 'Everyone') {
    const invalidTaskStatus = players
      .filter((player) => player.taskStatus !== req.body.taskStatus)
      .map((player) => ({
        uid: player.userID,
        name: player.name,
        username: player.username,
        pid: player.playerUpdateID,
      }));

    if (invalidTaskStatus.length > 0) {
      res.status(400).json({ invalidTaskStatus });
      return;
    }
  } else {
    if (
      !(await checkUserAuthorization(req, {
        validRoles: ['SHL_HO', 'SHL_COMMISSIONER', 'SMJHL_INTERN'],
      }))
    ) {
      res.status(401).end(`Not authorized`);
      return;
    }
  }

  let taskGroupID: number | undefined = undefined;

  const taskGroupIDResponse = await query<{ nextAvailableTaskGroupID: number }>(
    SQL`SELECT MAX(taskGroupID) + 1 AS nextAvailableTaskGroupID FROM TPEEvents;`,
  );

  if ('error' in taskGroupIDResponse) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!taskGroupIDResponse.length) {
    res.status(400).end('Invalid request');
    return;
  }

  taskGroupID = taskGroupIDResponse[0]?.nextAvailableTaskGroupID ?? 1;

  const results = await transaction()
    .query(() => [
      'INSERT INTO TPEEvents (userID, playerUpdateID, TPEChange, taskType, taskDescription, taskThreadID, taskGroupID) VALUES ?',
      [
        req.body.events.map((tpeEvent) => [
          req.cookies.userid,
          tpeEvent.pid,
          tpeEvent.TPEChange,
          tpeEvent.taskType,
          tpeEvent.taskDescription,
          tpeEvent.taskThreadID,
          taskGroupID,
        ]),
      ],
    ])
    .rollback((_e: any) => {})
    .commit();

  await endTransaction();

  if ('error' in results) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (!results.length) {
    res.status(400).end('Invalid request');
    return;
  }

  res.status(200).json({
    status: 'success',
  });
}
