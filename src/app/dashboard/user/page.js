"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";


export default function Dashboard() {
    const [user, setUser] = useState(null)
    const [currentPoint, setCurrentPoint] = useState(0)
    const [currentRank, setCurrentRank] = useState(0)
    const [contributions, setContributions] = useState()
    useEffect(() => {
        let user = localStorage.getItem("taiga_user")
        if (!user) {
            // redirect to login
            document.location = "/login"
        }
        // check if token is valid
        user = JSON.parse(user)
        const toastLoading = toast.loading("Checking if you're still handsome")
        let host = new URL(user.photo)
        host = host.origin
        fetch(host + "/api/v1/users/me", {
            headers: {
                "Authorization": `Bearer ${user.auth_token}`
            },
            method: "GET",
        }).then(resp => resp.json().then(data => {
            if (data.detail == "Invalid token") {
                localStorage.removeItem("taiga_user")
                toast.error("Your token is invalid, please login again", {
                    id: toastLoading
                })
                // redirect to login
                document.location = "/login"
            }
            else {
                toast.remove(toastLoading)
                setUser(user)
            }
        }).catch(err => {
            localStorage.removeItem("taiga_user")
            toast.error("Your handsomeness has worn out", {
                id: toastLoading
            })
            // redirect to login
            document.location = "/login"
        }))
    }, [])

    const calculatePoint = async (projects, month) => {
        // month is year-mm
        if (projects.length == 0) {
            toast.error("Please select at least one project")
            return false
        }
        if (!month) {
            toast.error("Please select a month")
            return 0
        }

        let loadingToast = toast.loading("Calculating your handsomeness")

        let milestones_byproject = []
        let done_point = 0
        let total_point = 0
        for (let project of projects) {
            let milestonethismonth = []
            let host = new URL(user.photo)
            host = host.origin
            try {

                let data = await fetch(host + `/api/v1/milestones?project=${project.id}`, {
                    headers: {
                        Authorization: `Bearer ${user.auth_token}`
                    }
                })
                data = await data.json()
                // check if milestone is this month
                // console.log(data)
                milestonethismonth = data.filter(milestone => {
                    return milestone.estimated_finish.includes(month)
                })
            } catch (err) {
                toast.error("Something went wrong",
                    {
                        id: loadingToast
                    })
            }
            let userStoryByMilestone = []
            for (let milestone of milestonethismonth) {
                let userStories = []
                for (let userStory of milestone.user_stories) {
                    let data = await fetch(host + `/api/v1/userstories/${userStory.id}`, {
                        headers: {
                            Authorization: `Bearer ${user.auth_token}`
                        }
                    })
                    data = await data.json()
                    if (data.assigned_users.includes(user.id)) {
                        userStories.push({
                            id: data.id,
                            mypoint: data.total_points / data.assigned_users.length,
                            name: data.subject,
                            status: data.status_extra_info.name,
                        })
                        total_point += data.total_points / data.assigned_users.length

                        if (data.status_extra_info.name == "Done") {
                            done_point += data.total_points / data.assigned_users.length
                        }
                    }
                }
                userStoryByMilestone.push({
                    name: milestone.name,
                    userstories: userStories
                })
            }
            milestones_byproject.push({
                name: project.name,
                milestones: userStoryByMilestone
            })
        }
        setContributions(milestones_byproject)
        setCurrentPoint(done_point)
        toast.success("Dammn, you're so handsome", {
            id: loadingToast
        })
    }

    return <main className="flex flex-col p-8 gap-4">
        <div className="flex w-full p-8 border border-pink-0 bg-purple-50 items-center gap-4">
            <img className="rounded-full" src={user?.photo} width={64} height={64} ></img>
            <div className="flex flex-col w-full">
                <span className="text-[18px]">{user?.username}</span>
                <span className="text-[12px]">{user?.bio}</span>
            </div>
            <div className="flex">
                <div className="flex flex-col px-4">
                    <span className="text-[12px]">Point</span>
                    <span className="text-[32px] leading-[48px]">{currentPoint}</span>
                </div>
                <div className="w-[2px] mx-4 bg-[#666666]">
                    {/* this is separator */}
                </div>
                <div className="flex flex-col px-4">
                    <span className="text-[12px]">Rank</span>
                    <span className="text-[32px] leading-[48px]">#{currentRank}</span>
                </div>
            </div>
        </div>
        <UserInput user={user} calculatePoint={calculatePoint} />
        <ContributionsSummary contributions={contributions}/>
    </main>
}

const ContributionsSummary = ({ contributions, setCurrentPoint, currentPoint }) => {
    const DoneBadge = () => <span className="bg-green-100 border border-green-0 rounded-md px-2 py-1">Done</span>
    const OnGoingBadge = () => <span className=" min-w-min bg-yellow-100 border border-yellow-0 rounded-md px-2 py-1">On Going</span>
    return <div className="w-full flex flex-col border border-pink-50">
        <table>
            <thead className="border border-pink-50">
                <tr>
                    <th className="py-[18px] px-8 text-left">Project</th>
                    <th className="py-[18px] px-8 text-left">Milestone</th>
                    <th className="py-[18px] px-8 text-left">User Story</th>
                    <th className="py-[18px] px-8 text-left">Status</th>
                    <th className="py-[18px] px-8 text-left">Point</th>
                </tr>
            </thead>
            <tbody>
                {contributions?.map(project => {
                    let dummy = <></>
                    let first_project = true
                    for (let milestone of project.milestones) {
                        let first_milestone = true
                        for (let user_stories of milestone.userstories) {
                            let current = <tr key={user_stories.id} className=" border-b-[1px] border-purple-0">
                                <td className="py-[18px] px-8 text-left">{first_project ? project.name : ""}</td>
                                <td className="py-[18px] px-8 text-left">{first_milestone ? milestone.name : ""}</td>
                                <td className="py-[18px] px-8 text-left">{user_stories.name}</td>
                                <td className="py-[18px] px-8 text-left">{user_stories.status == "Done"? <DoneBadge/> : <OnGoingBadge/>}</td>
                                <td className="py-[18px] px-8 text-left">{user_stories.mypoint}</td>
                            </tr>
                            first_project = false
                            first_milestone = false

                            dummy = <>{dummy}{current}</>
                        }
                    }
                    return dummy
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