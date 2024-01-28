import Cors from 'cors';
import { query, userQuery } from 'lib/db';
import use from 'lib/middleware';
import { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { InternalBankBalance, InternalPlayerInfo } from 'typings/portal-db';

const DEFAULT_SHL_URL = `https://simulationhockey.com/`;

export type BankAccountHeaderData = {
  uid: number;
  username: string;
  avatar: string;
  bankBalance: number;
  currentLeague: 'SHL' | 'SMJHL' | null;
  currentTeamID: number | null;
  playerUpdateID: number | null;
  playerName: string | null;
};

const cors = Cors({
  methods: ['GET', 'HEAD'],
});

export default async (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> => {
  await use(req, res, cors);

  const { uid } = req.query;

  if (uid === undefined) {
    res.status(400).end('Invalid request');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const response = await userQuery<{
    uid: number;
    username: string;
    avatar: string;
    avatartype: 'remote' | 'upload' | '0' | '';
  }>(SQL`
    SELECT uid, username, avatar, avatartype
    FROM mybb_users
    WHERE uid=${uid}
  `);

  if ('error' in response || response.length === 0) {
    res.status(500).end('Server connection failed');
    return;
  }

  const [user] = response;

  const userAvatar =
    user.avatartype === 'upload'
      ? `${DEFAULT_SHL_URL}${user.avatar.substring(2)}`
      : user.avatartype !== '' && user.avatar !== 'noavatar'
      ? user.avatar
      : `${DEFAULT_SHL_URL}images/default_avatar.png`;

  const balanceResponse = await query<InternalBankBalance>(
    SQL`SELECT * FROM bankBalance WHERE uid=${uid}`,
  );

  if ('error' in balanceResponse || balanceResponse.length === 0) {
    res.status(500).end('Server connection failed');
    return;
  }

  const [bank] = balanceResponse;

  const playerResponse = await query<InternalPlayerInfo>(
    SQL`SELECT * FROM playerInfo WHERE userID=${uid} AND status='active';`,
  );

  if ('error' in playerResponse) {
    res.status(500).end('Server connection failed');
    return;
  }

  res.status(200).json({
    uid: user.uid,
    username: user.username,
    avatar: userAvatar,
    bankBalance: bank.bankBalance,
    currentLeague: playerResponse[0]?.currentLeague,
    currentTeamID: playerResponse[0]?.currentTeamID,
    playerUpdateID: playerResponse[0]?.playerUpdateID,
    playerName: playerResponse[0]?.name,
  });
};
