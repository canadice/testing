import excuteQuery from "../../lib/db";

export default async function handler(req, res) {
    if (req.method === "GET") {
        const users = await excuteQuery({
            query: "SELECT username FROM mybb_users",
            values: []
        })

        console.log(users);
        res.status(200).json({ users: users })
    }

}


