
import clientPromise from "@/lib/mongoclient";

const USERNAME = process.env.TAIGA_USERNAME;
const PASSWORD = process.env.TAIGA_PASSWORD;
const HOSTNAME = process.env.TAIGA_HOSTNAME;


export async function GET(req) {
    try {
        const client = await clientPromise;
        const db = client.db("taiga-point-counter-web");


        const hostname = HOSTNAME

        if (hostname != HOSTNAME) {
            return new Response("Sorry, we currently support our internal taiga. Please open an issue or pull request if you need this feature", {
                status: 400,
                headers: { "Content-Type": "text/plain" },
            });
        }
        // if lastUpdated is not more than 1 hour ago, return 403
        const contribution = await db.collection("leaderboard").findOne({ hostname: hostname, month: new Date().toISOString().slice(0, 7) });
        let currentTimeInUTC7 = new Date()
        currentTimeInUTC7.setHours(currentTimeInUTC7.getHours() + 7)
        if (contribution && new Date(contribution.lastUpdated) > currentTimeInUTC7.setHours(currentTimeInUTC7.getHours() - 1)) {
            return new Response("Please wait for 1 hour before refreshing", {
                status: 403,
                headers: { "Content-Type": "text/plain" },
            });
        }

        // year-month
        const currentMonth = new Date().toISOString().slice(0, 7);

        // login to taiga
        const login = await fetch(`${hostname}/api/v1/auth`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                type: "normal",
                username: USERNAME,
                password: PASSWORD,
            }),
        });

        const loginResult = await login.json();

        // get all projects
        const projects = await fetch(`${hostname}/api/v1/projects`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${loginResult.auth_token}`,
            },
        });

        const projectsResult = await projects.json();

        // get all users
        var users = await fetch(`${hostname}/api/v1/users`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${loginResult.auth_token}`,
            },
        }).then((res) => res.json());

        users = users.map(user => {
            return {
                name: user.full_name,
                username: user.username,
                id: user.id,
                point: 0,
                task: 0,
                doneTask: 0,
                image: user.photo
            }
        })
        let host = hostname
        let month = currentMonth
        let user = loginResult
        for (let project of projectsResult) {
            let milestonethismonth = await fetch(host + `/api/v1/milestones?project=${project.id}`, {
                headers: {
                    Authorization: `Bearer ${user.auth_token}`
                },
                method: "GET"
            }).then(resp => resp.json())
            milestonethismonth = milestonethismonth.filter(milestone => milestone.estimated_finish && milestone.estimated_finish.includes(month))

            for (let milestone of milestonethismonth) {
                for (let userstory of milestone.user_stories) {
                    let user_story = await fetch(host + `/api/v1/userstories/${userstory.id}`, {
                        headers: {
                            Authorization: `Bearer ${user.auth_token}`
                        },
                        method: "GET"
                    }).then(resp => resp.json())

                    for (let user of users) {
                        if (user_story.assigned_users.includes(user.id)) {
                            user.task += 1
                            if (user_story.status_extra_info.name == "Done") {
                                user.doneTask += 1
                                user.point += user_story.total_points / user_story.assigned_users.length
                            }
                        }
                    }
                }
            }
        }
        // sort users by point
        users = users.sort((a, b) => b.point - a.point)

        // current UTC+7
        let date = new Date()
        date.setHours(date.getHours() + 7)
        let lastUpdated = date.toISOString()
        // update leaderboard
        await db.collection("leaderboard").updateOne({ hostname: hostname, month: month }, { $set: { hostname: hostname, month: month, users: users, lastUpdated: lastUpdated } }, { upsert: true })
        return new Response("OK")
    } catch (e) {
        console.log(e)
        return new Response("Internal Server Error", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
        });
    }
}
