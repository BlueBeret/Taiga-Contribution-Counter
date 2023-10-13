"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function Dashboard() {
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
        }).catch(err => {
            localStorage.removeItem("taiga_user")
            toast.error("Your handsomeness has worn out", {
                id: toastLoading
            })
            // redirect to login
            document.location = "/login"
        }))
    }, [])


    return <main>
        hello
    </main>
}