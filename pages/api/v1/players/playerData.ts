import type { NextApiRequest, NextApiResponse } from 'next';
import SQL from 'sql-template-strings';

import { query } from '../../../../lib/db';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse,
) {
    if (req.method !== 'POST') {
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const response = await query(SQL`
    SELECT *
    FROM player_data 
    WHERE Name = ${req.body.name}
  `);

    if ('error' in response) {
        res.status(500).end('Server connection failed');
        return;
    }

    if (response.length > 1) {
        res.status(500).end('Multiple players with the same name exists');
        return;
    }

    if (response.length === 0) {
        res.status(200).json({
            status: 'error',
            errorMessage: 'A player with this name cannot be found',
        });
        return;
    }

    const [data] = response;

    res.status(200).json({
        status: 'success',
        payload: {
            data
        },
    });
}




