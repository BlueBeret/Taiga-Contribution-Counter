"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import LOADINGMESSAGE from "./loadingmessage"
import { useCheckUser } from "@/hooks/authHooks";

export default function Dashboard() {
    const user = useCheckUser()
    const [contributions, setContributions] = useState()
    const calculateAllUsersPoints = async (projects, month) => {
        // month is year-mm
        if (projects.length == 0) {
            toast.error("Please select at least one project")
            return false
        }
        if (!month) {
            toast.error("Please select a month")
            return 0
        }

        let loadingToast = toast.loading("Wait a sec, we're calculating a lot of things")
        let host = new URL(user.photo)
        host = host.origin
        let time = new Date()
        try {
            let users = await fetch(host + "/api/v1/users", {
                headers: {
                    Authorization: `Bearer ${user.auth_token}`
                },
                method: "GET"
            }).then(resp => resp.json())

            users = users.map(user => {
                return {
                    name: user.full_name,
                    id: user.id,
                    point: 0,
                    task: 0,
                    doneTask: 0,
                    image: user.photo
                }
            })

            for (let project of projects) {
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
                        let current_time = new Date()
                        if (current_time - time > 2000) {
                            time = current_time
                            toast.loading(LOADINGMESSAGE[Math.floor(Math.random() * LOADINGMESSAGE.length)], {
                                id: loadingToast
                            })
                        }
                    }
                }
            }
            toast.success("Done calculating", {
                id: loadingToast
            })
            // sort users by point
            users = users.sort((a, b) => b.point - a.point)
            setContributions(users)
        }
        catch (err) {
            toast.error("Something went wrong when fetching users")
            console.log(err)
            return false
        }

    }

    return <main className="flex flex-col p-8 gap-4">
        <UserInput user={user} calculatePoint={calculateAllUsersPoints} />
        <ContributionsSummary contributions={contributions} />
    </main>
}

const ContributionsSummary = ({ contributions, setCurrentPoint, currentPoint }) => {
    const DoneBadge = () => <span className="bg-green-100 border border-green-0 rounded-md px-2 py-1">Done</span>
    const OnGoingBadge = () => <span className=" min-w-min bg-yellow-100 border border-yellow-0 rounded-md px-2 py-1">On Going</span>
    return <div className="w-full flex flex-col border border-pink-50">
        <table>
            <thead className="border border-pink-50">
                <tr>
                    <th className="py-[18px] px-8 text-left">Username</th>
                    <th className="py-[18px] px-8 text-left">Task</th>
                    <th className="py-[18px] px-8 text-left">Completed</th>
                    <th className="py-[18px] px-8 text-left">Point</th>
                </tr>
            </thead>
            <tbody>
                {contributions?.map(contribution => {
                    return <tr key={contribution.id} className="border border-pink-50">
                        <td className="py-[18px] px-8 flex items-center">
                            <img src={contribution.image} className="w-8 h-8 rounded-full mr-4" />
                            <span>{contribution.name}</span>
                        </td>
                        <td className="py-[18px] px-8">{contribution.task}</td>
                        <td className="py-[18px] px-8">{contribution.doneTask}</td>
                        <td className="py-[18px] px-8">{contribution.point}</td>
                    </tr>
                })}
            </tbody>
        </table>
    </div>
}

const UserInput = ({ user, calculatePoint }) => {
    const [availableProjects, setAvailableProjects] = useState([
        {
            name: "Project 1",
            id: 1
        },
        {
            name: "Project 2",
            id: 2
        },
        {
            name: "Project 3",
            id: 3
        }
    ])
    const [isSelectingProject, setIsSelectingProject] = useState(false)
    const [projects, setProjects] = useState([])
    const [month, setMonth] = useState("")

    useEffect(() => {
        const target = document.querySelector('#project-select')
        const target2 = document.querySelector('#project-select-button')

        document.addEventListener('click', (event) => {
            const withinBoundaries = event.composedPath().includes(target) || event.composedPath().includes(target2)

            if (withinBoundaries) {
            } else {
                setIsSelectingProject(false)
            }
        })
    }, [])

    // get project list
    useEffect(() => {
        if (!user) return
        let host = new URL(user?.photo)
        host = host.origin
        fetch(host + "/api/v1/projects", {
            headers: {
                "Authorization": `Bearer ${user.auth_token}`
            },
        }).then(resp => resp.json().then(data => {
            data = data.filter(project => project.i_am_member)
            setAvailableProjects(data)
        }))
    }, [user])

    return <div className="flex gap-4">
        <span className="mr-auto py-2 px-4">Point calculator</span>

        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} placeholder="select month" className="bg-purple-50 w-[344px] py-2 px-4"></input>
        <div>
            <div id="project-select-button" value={`${projects.length} ${projects.length > 1 ? "projects" : "project"} selected`} placeholder="select month" onClick={(e) => setIsSelectingProject(!isSelectingProject)}
                className="bg-purple-50 w-[344px] py-2 px-4 cursor-pointer">
                {`${projects.length} ${projects.length > 1 ? "projects" : "project"} selected`}
            </div>

            {/* dropdown to select project */}
            <div id="project-select" className={`${isSelectingProject ? "absolute" : "hidden"} w-[344px] bg-purple-50`}>
                {availableProjects.map(project => {
                    let isSelected = projects.find(p => p.id == project.id)

                    return <div key={project.id} className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 py-2 px-4 rounded-md" onClick={(e) => {
                        // remove if already selected
                        if (isSelected) {
                            setProjects(projects.filter(p => p.id != project.id))
                        } else {
                            setProjects([...projects, project])
                        }
                    }}> <span className="border border-white w-4 h-4 flex justify-center items-center">
                            <div className={`${isSelected ? "w-2 h-2 rounded-[1px] bg-white" : ""}`}>
                            </div>
                        </span>
                        <span>{project.name}</span>
                    </div>
                })}
            </div>
        </div>
        <button className="bg-pink-0 text-purple-100 py-2 px-4 rounded-md" onClick={(e) => calculatePoint(projects, month)}>Calculate</button>
    </div>
}