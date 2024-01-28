import * as jwt from 'jsonwebtoken';
import { query } from 'lib/db';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import {
  convertRefreshTokenExpirationDate,
  getRefreshTokenExpirationDate,
} from 'utils/authHelpers';
import { v4 as uuid } from 'uuid';

export type TokenData =
  | {
      status: 'success';
      payload: {
        userid: number;
        accessToken: string;
        refreshToken: string;
      };
    }
  | {
      status: 'logout';
      errorMessage: string;
    };

type InternalUserToken = {
  uid: number;
  invalid: 0 | 1;
  expires_at: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<TokenData>,
) {
  if (req.method !== 'POST') {
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const response = await query<InternalUserToken>(SQL`
    SELECT uid, invalid, expires_at
    FROM refreshTokens 
    WHERE token = ${req.body.refreshToken}
  `);

  if ('error' in response) {
    res.status(500).end('Server connection failed');
    return;
  }

  if (response.length === 0) {
    res.status(500).end('No Refresh Token found');
    return;
  }

  const [user] = response;

  if (
    convertRefreshTokenExpirationDate(user.expires_at) < Date.now() ||
    user.invalid
  ) {
    res.status(200).json({
      status: 'logout',
      errorMessage: 'Refresh token expired',
    });
    return;
  }

  const accessToken = jwt.sign({ userid: user.uid }, process.env.SECRET ?? '', {
    expiresIn: '15m',
  });

  // refresh token should be opaque to the user
  const refreshToken = uuid();
  const expiresAt = getRefreshTokenExpirationDate();

  await query(SQL`
    INSERT INTO refreshTokens (uid, expires_at, token)
      VALUES (${user.uid}, ${expiresAt}, ${refreshToken})
      ON DUPLICATE KEY UPDATE token=${refreshToken}, expires_at=${expiresAt}
  `);

  res.status(200).json({
    status: 'success',
    payload: {
      userid: user.uid,
      accessToken,
      refreshToken,
    },
  });
}
