import { userQuery } from "../../lib/db";
import SQL from "sql-template-strings";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const users = await userQuery(SQL`
        SELECT *
        FROM mybb_users 
      `);
        res.status(200).json({ users: users })
    }

}


