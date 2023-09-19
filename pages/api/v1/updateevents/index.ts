import Cors from 'cors';
import { query } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { UpdateEvents } from 'typings';
import { InternalUpdateEvents, InternalUserInfo } from 'typings/portal-db';

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse<UpdateEvents[]>,
): Promise<void> => {
  await use(req, res, cors);

  const { pid, uid, change, status } = req.query;

  const response = await query<InternalUpdateEvents & InternalUserInfo>(
    SQL`SELECT updateEvents.*, user.* FROM updateEvents
        INNER JOIN userInfo as user 
        ON updateEvents.performedByID = user.userID WHERE 1 `
      .append(pid !== undefined ? SQL`AND playerUpdateID=${pid} ` : '')
      .append(uid !== undefined ? SQL`AND performedByID=${uid} ` : '')
      .append(change !== undefined ? SQL`AND attributeChanged=${change} ` : '')
      .append(status !== undefined ? SQL`AND status=${status} ` : '')
      .append(`ORDER BY eventID DESC`),
  );

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  const parsed = response.map((data) => ({
    eventID: data.eventID,
    playerUpdateID: data.playerUpdateID,
    attributeChanged: data.attributeChanged,
    oldValue:
      data.oldValue === 'NULL'
        ? ''
        : data.attributeChanged === 'currentTeamID' ||
          data.attributeChanged === 'shlRightsTeamID'
        ? data.oldValue.split('|')?.[1] ?? data.oldValue
        : data.oldValue,
    newValue:
      data.newValue === 'NULL'
        ? ''
        : data.attributeChanged === 'currentTeamID' ||
          data.attributeChanged === 'shlRightsTeamID'
        ? data.newValue.split('|')?.[1] ?? data.newValue
        : data.newValue,
    eventDate: data.eventDate,
    performedByID: data.performedByID,
    performedBy: data.username,
    status: data.status,
    approvedByID: data.approvedByID,
    approvedBy: 'TBD',
    approvalDate: data.approvalDate,
  }));

  res.status(200).json(parsed);
};
