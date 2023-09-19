import { query } from "../../lib/db";
import SQL from "sql-template-strings";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const data = await query(SQL`
        SELECT *
        FROM game_data_outfield 
        WHERE Name = 'Henrik Lind'
      `);
    res.status(200).json({ data: data })
  }

}


