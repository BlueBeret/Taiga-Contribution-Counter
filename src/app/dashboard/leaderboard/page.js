"use client"
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState();
    const [user, setUser] = useState(null)

    const thisMonthName = new Date().toLocaleString("default", { month: "long" });
    const thisYear = new Date().getFullYear();

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

    useEffect(() => {
        if (!user) return
        let hostname = new URL(user.photo)
        hostname = hostname.origin
        fetch("/api/leaderboard?hostname=" + hostname)
            .then((res) => res.json())
            .then((data) => {
                setLeaderboard(data);
            });
    }, [user]);
    return <div className="w-full max-h-[900px] p-8 flex gap-8 items-start overflow-clip">
        <div className="rank-cards-container no-scroll w-[550px] max-h-[900px] flex flex-col overflow-auto gap-4">
            <div className="flex flex-col gap-0">
                <span className="text-pink-0">
                    {thisMonthName} {thisYear} Nyan Nyan warrios
                </span>
                <span className="text-[#999999] text-[10px]">
                    lastUpdated: {leaderboard && leaderboard.lastUpdated}
                </span>
            </div>
            {leaderboard && leaderboard.users.map((user, index) => {
                let rank = index + 1
                // point 2 decimal places
                let point = user.point.toFixed(2)
                return <div key={index} className={`w-[500px] relative border flex items-center px-8 py-[18px] gap-4 ${rank > 3 ? "border-orange-0" : "border-yellow-0"}`}>
                    <img src={user.image} height={40} width={40} className="rounded-full"></img>
                    <span className="w-[120px]">{user.name}</span>
                    <div className="flex ml-auto ">
                        <div className="flex flex-col px-4">
                            <span className="text-[12px]">Point</span>
                            <span className="text-[32px] leading-[48px]">{point}</span>
                        </div>
                        <div className="w-[2px] mx-4 bg-[#666666]">
                            {/* this is separator */}
                        </div>
                        <div className="flex flex-col px-4 justify-center h-full">
                            {rank <= 3 ? "" : <span className="text-[12px]">Rank</span>}
                            {
                                rank <= 3 ? <img src={`/${rank}.png`} height={60 - (rank * 5)} width={60 - (rank * 5)}></img> :
                                    <span className="text-[32px] leading-[48px]">#{rank}</span>
                            }
                        </div>
                    </div>
                </div>
            })}
        </div>
        {leaderboard && <Graph users={leaderboard?.users}></Graph>}
    </div>
}
const Graph = ({ users }) => {
    // only get 10 users
    users = users.slice(0, 15)

    const maxPoint = users[0].point

    return <div className="flex flex-col items-center justify-center overflow-hidden">
        <h1 className="text-pink-0 text-[32px] leading-[48px]">Cat'O Meter</h1>
        <div className="flex items-end h-full w-full gap-4">
        {users.map((user, index) => {
            let percent = user.point / maxPoint * 700
            // set to int
            percent = Math.floor(percent)

            let point = user.point.toFixed(2)
            return <div key={index}>
                <span>{point}</span>
                <div  className={`w-[60px] bg-white`} style={
                    {
                        height: percent,
                        backgroundImage: `url(${user.image})`,
                        backgroundRepeat: "repeat-y"
                    }
                } >
                </div>
            </div>
        })}
    </div>
    </div>
}
