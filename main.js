import clientPromise from "@/lib/mongoclient";

const USERNAME = process.env.TAIGA_USERNAME;
const PASSWORD = process.env.TAIGA_PASSWORD;
const HOSTNAME = process.env.TAIGA_HOSTNAME;

const abs = (float) => {
    return float < 0 ? -float : float
}

async function UpdateLeaderboard() {
    try {
        const timestart = performance.now()
        const client = await clientPromise;
        const db = client.db("taiga-point-counter-web");

        const hostname = HOSTNAME

        // if lastUpdated is not more than 1 hour ago, return 403
        const contribution = await db.collection("leaderboard").findOne({ hostname: hostname, month: new Date().toISOString().slice(0, 7) });
        let currentTimeInUTC7 = new Date()
        currentTimeInUTC7.setHours(currentTimeInUTC7.getHours() + 7)
        let isdevelop = true
        if (!isdevelop && contribution && new Date(contribution.lastUpdated) > currentTimeInUTC7.setHours(currentTimeInUTC7.getHours() - 1)) {
            return new Response("Please wait for 1 hour before refreshing", {
                status: 403,
                headers: { "Content-Type": "text/plain" },
            });
        }

        // year-month
        const currentMonth = new Date().toISOString().slice(0, 7);

        // login to taiga
        console.log("LA: Logging In...")
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

        var loginResult = await login.json();

        console.log("LA: Fetching User")
        let users = await fetch(hostname + `/api/v1/users`, {
            headers: {
                Authorization: `Bearer ${loginResult.auth_token}`
            },
            method: "GET"
        }).then(resp => resp.json())

        // get page 2
        let page = 2
        let users_data2 = []
        while (true) {
            try {
                users_data2 = await fetch(hostname + `/api/v1/users?page=${page}`, {
                    headers: {
                        Authorization: `Bearer ${loginResult.auth_token}`
                    },
                    method: "GET"
                }).then(resp => resp.json())
                if (users_data2.length == 0) break
                users = [...users, ...users_data2]
                page++
            }
            catch (e) {
                break
            }

        }
        // remove duplicate users
        users = users.filter((user, index, self) =>
            index === self.findIndex((t) => (
                t.id === user.id && user.id != 32
            ))
        )
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

        console.log("users: ", users.length)


        // get all projects
        const projects = await fetch(`${hostname}/api/v1/projects`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${loginResult.auth_token}`,
            },
        });

        const projectsResult = await projects.json();

        // refresh token
        let refresh_login = await fetch(`${hostname}/api/v1/auth/refresh`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refresh: loginResult.refresh,
            }),
        });

        loginResult = await refresh_login.json();

        console.log("projects: ", projectsResult.length)

        let host = hostname
        let month = currentMonth
        let user = loginResult
        let milestone_promises = []
        // fetching data
        for (let project of projectsResult) {
            let milestone_promise = fetch(host + `/api/v1/milestones?project=${project.id}`, {
                headers: {
                    Authorization: `Bearer ${user.auth_token}`
                },
                method: "GET"
            }).then(resp => resp.json()).then(async (milestones) => {
                let milestonethismonth = milestones.filter(milestone => milestone.estimated_finish && milestone.estimated_finish.includes(month))
                for (let milestone of milestonethismonth) {

                    let userstory_promises = []
                    // for (let userstory of tqdm(milestone.user_stories)) {
                    for (let userstory of milestone.user_stories) {
                        let us_promise = fetch(host + `/api/v1/userstories/${userstory.id}`, {
                            headers: {
                                Authorization: `Bearer ${user.auth_token}`
                            },
                            method: "GET"
                        }).then(resp => resp.json()).then(user_story => {

                            for (let user of users) {
                                if (user_story.assigned_users.includes(user.id)) {
                                    user.task += 1
                                    if (user_story.status_extra_info.name == "Done") {
                                        user.doneTask += 1

                                        let point = 0
                                        let start_tag = user_story.description.indexOf("=point")
                                        let end_tag = user_story.description.indexOf("=", start_tag + 1)

                                        if (start_tag != -1 && end_tag != -1) {
                                            // split by newline
                                            let lines = user_story.description.substring(start_tag + 6, end_tag).split("\n")
                                            // throw away empty lines
                                            lines = lines.filter(line => line.length > 5)
                                            // split by space
                                            lines = lines.map(line => line.split(/\s+/))

                                            let tmp_total = 0
                                            for (let line of lines) {
                                                // find number
                                                let number = line.find(word => !isNaN(word))
                                                let isMyPoint = line.find(word => word == "@" + user.username)
                                                if (number) {
                                                    tmp_total += parseFloat(number)
                                                }
                                                if (isMyPoint) {
                                                    point = parseFloat(number)
                                                }
                                            }

                                            if (abs(tmp_total - user_story.total_points) > 0.0001) {
                                                console.log("total point is not equal ", `${tmp_total} != ${user_story.total_points} in`, user_story.subject)
                                            }
                                        }
                                        if (point == 0) {
                                            point = user_story.total_points / user_story.assigned_users.length
                                        }
                                        user.point += point
                                    }
                                }
                            }
                        })
                        userstory_promises.push(us_promise)
                    }
                    await Promise.all(userstory_promises)
                }
            })
            milestone_promises.push(milestone_promise)
        }
        console.log("LA: Waiting for fetching data to finish...")
        await Promise.all(milestone_promises)
        // sort users by point
        users = users.sort((a, b) => b.point - a.point)

        // current UTC+7
        let date = new Date()
        date.setHours(date.getHours() + 7)
        let lastUpdated = date.toISOString()
        console.log("LA: Last Updated: ", lastUpdated)
        // update leaderboard
        await db.collection("leaderboard").updateOne({ hostname: hostname, month: month }, { $set: { hostname: hostname, month: month, users: users, lastUpdated: lastUpdated } }, { upsert: true })

        const runningtimeinseconds = (performance.now() - timestart) / 1000
        console.log("LA: Running Time: ", runningtimeinseconds, " seconds")
    } catch (e) {
        console.log(e)
    }
}

await UpdateLeaderboard()
console.log("LA: Done")
process.exit()