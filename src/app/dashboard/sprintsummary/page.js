"use client";
import { useEffect, useState } from "react";
import { useCheckUser } from "../../../hooks/authHooks";
import toast from "react-hot-toast";
import "./hyperlink.css"


export default function Dashboard() {
    const user = useCheckUser()
    const [totalPoint, setTotalPoint] = useState(0)
    const [contributions, setContributions] = useState([])
    const [detail, setDetail] = useState(false)

    const summarizeSprint = async (projects) => {
        // month is year-mm
        if (projects.length != 1) {
            toast.error("Please select at exactly one project")
            return false
        }
        const tid = toast.loading("Summarizing...")

        // get last milestone of the project
        let hostname = new URL(user.photo)
        hostname = hostname.origin

        let milestones = await fetch(hostname + `/api/v1/milestones?project=${projects[0].id}`, {
            headers: {
                Authorization: `Bearer ${user.auth_token}`
            },
            method: "GET"
        }).then(resp => resp.json())

        milestones = milestones.sort((a, b) => {
            let date_a = Date.parse(a.created_date)
            let date_b = Date.parse(b.created_date)
            return date_b - date_a
        }
        )

        let lastmilestone = milestones[0]

        // get all user stories of the milestone
        let users = []
        let global_total_point = 0
        let userstories = await fetch(hostname + `/api/v1/userstories?milestone=${lastmilestone.id}`, {
            headers: {
                Authorization: `Bearer ${user.auth_token}`
            },
            method: "GET"
        }).then(resp => resp.json())

        for (let userstory of userstories) {
            global_total_point += userstory.total_points
            let user_story = await fetch(hostname + `/api/v1/userstories/${userstory.id}`, {
                headers: {
                    Authorization: `Bearer ${user.auth_token}`
                },
                method: "GET"
            }).then(resp => resp.json())

            for (let user of user_story.assigned_users) {
                if (!users.find(u => u.id == user)) {
                    let tmp = {}
                    tmp.id = user
                    tmp.user_story = []
                    tmp.total_point = 0
                    console.log(user_story)
                    tmp.user_story.push({
                        id: user_story.id,
                        name: user_story.subject,
                        point: user_story.total_points / user_story.assigned_users.length,
                        link: hostname + `/project/${user_story.project_extra_info.slug}/us/${user_story.ref}`
                    })
                    tmp.total_point += user_story.total_points / user_story.assigned_users.length
                    users.push(tmp)
                } else {
                    let tmp = users.find(u => u.id == user)
                    tmp.user_story.push({
                        id: user_story.id,
                        name: user_story.subject,
                        point: user_story.total_points / user_story.assigned_users.length,
                        link: hostname + `/projects/${projects[0].id}/milestones/${lastmilestone.id}/userstories/${user_story.id}`
                    })
                    tmp.total_point += user_story.total_points / user_story.assigned_users.length
                }
            }
        }

        let users_data = await fetch(hostname + `/api/v1/users`, {
            headers: {
                Authorization: `Bearer ${user.auth_token}`
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
                        Authorization: `Bearer ${user.auth_token}`
                    },
                    method: "GET"
                }).then(resp => resp.json())
                if (users_data2.length == 0) break
                users_data = [...users_data, ...users_data2]
                page++
            }
            catch (e) {
                break
            }

        }

        for (let user of users) {
            let user_data = users_data.find(u => u.id == user.id)
            if (!user_data) {
                toast.error("User not found", user)
                console.log(user, users_data)
            }
            user.name = user_data.username
            // replace origin with process.env

            let tmp_photo;
            try {
                tmp_photo = new URL(user_data.photo)
                user.photo = process.env.NEXT_PUBLIC_BACKEND_URL + tmp_photo.pathname
            } catch (error) {
                console.log(user_data.photo)
                user.photo = "https://placehold.co/100"
            }

        }
        // sort users by id
        users = users.sort((a, b) => a.id - b.id)

        setContributions(users)
        setTotalPoint(global_total_point.toFixed(2))
        toast.success("Summarized", { id: tid })
    }
    return <main className="flex flex-col p-8 gap-4">
        <UserInput user={user} calculatePoint={summarizeSprint} detail={detail} setDetail={setDetail} />
        <SprintSummary contributions={contributions} total_point={totalPoint} detail={detail} setDetail={setDetail} />
    </main>
}

const SprintSummary = ({ contributions, setDetail, detail, total_point }) => {

    const handleCopyToClipboard = () => {
        let csv = ["user,point\n"]
        contributions.forEach(contribution => {
            csv.push(`${contribution.name},${contribution.total_point.toFixed(2)}\n`)
        })
        csv = csv.join("")
        navigator.clipboard.writeText(csv).then(() => {
            toast.success("Copied to clipboard")
        })
    }
    return <div className="overflow-x-auto flex justify-center gap-4 items-start w-full">
        <table className="min-w-[375px] max-w-min">
            <thead className="floor border border-pink-50">
                <tr className="">
                    <th className="py-2 px-2 lg:py-4 lg:px-8 text-left">User</th>
                    {detail && <th className="py-2 px-2 lg:py-4 lg:px-8 text-left whitespace-nowrap">User Story</th>}
                    <th className="py-2 px-2 lg:py-4 lg:px-8 text-left">Point</th>
                </tr>
            </thead>
            <tbody>
                {detail && contributions.map((user, index) => {
                    let a = user.user_story.map((user_story, index2) => {
                        if (index2 == 0) {
                            return <tr key={index2} className="border border-b-0 border-t-pink-50 border-l-pink-50 border-r-pink-50">
                                <td className="py-2 px-2 lg:py-4 lg:px-8 text-left w-[1px]" rowSpan={user.user_story.length + 1}>
                                    <div className="flex items-center gap-2 ">
                                        <img src={user.photo} alt="" className="w-6 h-6 rounded-full" />
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td className="py-2 px-2 lg:py-4 lg:px-8 text-left w-[1px] whitespace-nowrap">
                                    <a href={user_story.link} target="_blank">{user_story.name}</a>
                                </td>
                                <td className="py-2 px-2 lg:py-4 lg:px-8 text-left  w-[1px]">{user_story.point.toFixed(2)}</td>
                            </tr>
                        }
                        return <tr key={index2} className="border border-b-0 border-t-0 border-l-pink-50 border-r-pink-50">
                            <td className="py-2 px-2 lg:py-4 lg:px-8 text-left  w-[1px] whitespace-nowrap ">
                                <a href={user_story.link} target="_blank">{user_story.name}</a>
                            </td>
                            <td className="py-2 px-2 lg:py-4 lg:px-8 text-left w-[1px]">{user_story.point.toFixed(2)}</td>
                        </tr>
                    })
                    a.push(<tr key={index} className="border border-t-0 border-b-pink-50 border-l-pink-50 border-r-pink-50">
                        <td className="py-2 px-2 lg:py-4 lg:px-8 text-left font-bold  w-[1px] whitespace-nowrap">Total</td>
                        <td className="py-2 px-2 lg:py-4 lg:px-8 text-left font-bold  w-[1px]">{user.total_point.toFixed(2)}</td>
                    </tr>)

                    return a
                })}
                {detail && contributions.length > 0 && <tr className="border border-t-0 border-b-pink-50 border-l-pink-50 border-r-pink-50">
                    <td className="py-2 px-2 lg:py-4 lg:px-8 text-left font-bold  w-[1px] whitespace-nowrap">Total</td>
                    <td className="py-2 px-2 lg:py-4 lg:px-8 text-left font-bold  w-[1px]">{total_point}</td>
                </tr>}
                {!detail && contributions.map((user, index) => {
                    return <tr key={index} className="border border-b-0 border-t-pink-50 border-l-pink-50 border-r-pink-50">
                        <td className="py-2 px-2 lg:py-4 lg:px-8 text-left w-[1px]">
                            <div className="flex items-center gap-2 ">
                                <img src={user.photo} alt="" className="w-6 h-6 rounded-full" />
                                <span>{user.name}</span>
                            </div>
                        </td>
                        <td className="py-2 px-2 lg:py-4 lg:px-8 text-left  w-[1px]">{user.total_point.toFixed(2)}</td>
                    </tr>
                })}
                {!detail && contributions.length > 0 && <tr className="border  border-pink-50">
                    <td className="py-2 px-2 lg:py-4 lg:px-8 text-left font-bold  w-[1px] whitespace-nowrap">Total</td>
                    <td className="py-2 px-2 lg:py-4 lg:px-8 text-left font-bold  w-[1px]">{total_point}</td>
                </tr>}
            </tbody>
        </table>
        {total_point != 0 && <div className="text-center mt-2">
            <button className="bg-pink-0 text-purple-100 py-2 px-4 rounded-md " onClick={handleCopyToClipboard}>
                Total point: {total_point}
            </button>
        </div>}
    </div>
}

const UserInput = ({ user, calculatePoint, detail, setDetail }) => {
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
        if (!user?.auth_token) return
        let host = new URL(user?.photo)
        host = host.origin
        fetch(host + "/api/v1/projects", {
            headers: {
                "Authorization": `Bearer ${user.auth_token}`
            },
        }).then(resp => resp.json().then(data => {
            data = data.filter(project => project.i_am_member)
            data = data.sort((a, b) => {
                let date_a = Date.parse(a.created_date)
                let date_b = Date.parse(b.created_date)
                return date_b - date_a
            })
            setAvailableProjects(data)
        }))
    }, [user])

    return <div className="flex gap-4 w-full flex-wrap">
        <span className="mr-auto py-2 px-4 hidden lg:block">Sprint Summary</span>

        <div className="flex gap-4">
            <div className="h-full flex items-center">
                <button onClick={(e) => setDetail(!detail)} className={`transition-all delay-150  ${!detail ? "text-[#666666] border border-[#666666]" : " border border-pink-0"} px-4 py-2 rounded-md`}> detail</button>
            </div>
            <div id="project-select-button" placeholder="select month" onClick={(e) => setIsSelectingProject(!isSelectingProject)}
                className="bg-purple-50 w-full lg:w-[344px] py-2 px-4 cursor-pointer">
                {projects[0]?.name || "Select project"}
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
            <button className="bg-pink-0 text-purple-100 py-2 px-4 rounded-md" onClick={(e) => calculatePoint(projects)}>Summarize</button>
        </div>
    </div>
}