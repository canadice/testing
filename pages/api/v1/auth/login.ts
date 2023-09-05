import { MD5 } from 'crypto-js';
import * as jwt from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';
import { v4 as uuid } from 'uuid';

import { userQuery, query } from '../../../../lib/db';
import { getRefreshTokenExpirationDate } from '../../../../utils/authHelpers';

export type LoginData =
    | {
        status: 'success';
        payload: {
            userid: number;
            usergroup: number;
            accessToken: string;
            refreshToken: string;
        };
    }
    | {
        status: 'error';
        errorMessage: string;
    };

type InternalLoginUser = {
    uid: number;
    usergroup: number;
    username: string;
    password: string;
    salt: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<LoginData>,
) {
    if (req.method !== 'POST') {
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const response = await userQuery<InternalLoginUser>(SQL`
    SELECT uid, username, password, salt, usergroup
    FROM mybb_users 
    WHERE username = ${req.body.username}
  `);

    if ('error' in response) {
        res.status(500).end('Server connection failed');
        return;
    }

    if (response.length > 1) {
        res.status(500).end('Multiple users with same username');
        return;
    }

    if (response.length === 0) {
        res.status(200).json({
            status: 'error',
            errorMessage: 'Invalid username or password',
        });
        return;
    }

    const [user] = response;

    if (user.usergroup === 7) {
        res.status(200).json({
            status: 'error',
            errorMessage: 'You have been banned. You cannot login.',
        });
        return;
    }

    if (user.usergroup === 5) {
        res.status(200).json({
            status: 'error',
            errorMessage:
                'Your account is still awaiting activation. Please be sure to verify your account. Follow-up on the forum or on our Discord if you feel this is an error.',
        });
        return;
    }

    const saltedPassword = MD5(
        MD5(user.salt).toString() + MD5(req.body.password).toString(),
    ).toString();

    if (saltedPassword !== user.password) {
        res.status(200).json({
            status: 'error',
            errorMessage: 'Invalid username or password',
        });
        return;
    }

    const accessToken = jwt.sign({ userid: user.uid }, process.env.SECRET ?? '', {
        expiresIn: '15m',
    });

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
            usergroup: user.usergroup,
            accessToken,
            refreshToken,
        },
    });
}