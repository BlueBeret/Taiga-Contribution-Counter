"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useCheckUser } from "@/hooks/authHooks";

export default function Dashboard() {
    const user = useCheckUser();
    useEffect(() => {
        if (user) {
            document.location = "/dashboard/user"
        } else {
            toast.loading("Loading")
        }
    }, [user])
    return <main> 
    </main>
}