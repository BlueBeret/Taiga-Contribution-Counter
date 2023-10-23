"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

function Login(params) {
    const [hostname, setHostname] = useState("")
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    useEffect(() => {
        // try to get user data from localstorage
        let user = localStorage.getItem("taiga_user")
        if (user) {
            user = JSON.parse(user)
            // redirect to dashboard
            document.location = "/dashboard"
        }
    }, [])

    function handleLogin(e) {
        e.preventDefault()
        // check if hostname is like http://domainorip:port
        // check if username is not empty
        // check if password is not empty
        const urlPattern = /^(https?:\/\/)([^:\/]+)(:\d+)?(\/.*)?$/;
        let isHostnameValid = urlPattern.test(hostname)
        let isUsernameValid = username.length > 0
        let isPasswordValid = password.length > 0

        if (!isHostnameValid) {
            toast.error("Hostname doesn't match this format https://domainorip:port")
            return
        }
        if (!isUsernameValid || !isPasswordValid) {
            toast.error("Username or password can't be empty")
            return
        }

        const toastLoading = toast.loading("Logging In")

        fetch(hostname + "/api/v1/auth",
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                mode: "cors",
                method: "POST",
                body: JSON.stringify({
                    type: "normal",
                    password: password,
                    username: username,
                })
            }
        ).then(resp => resp.json().then(data => {
            if (data.code == "invalid_credentials")
                toast.error(data.detail, {
                    id: toastLoading
                })
            else if (data.username) {
                // save data to localstorage
                localStorage.setItem("taiga_user", JSON.stringify(data))
                toast.success("Hi " + data.username + ", have a great day!", {
                    id: toastLoading
                })
                // redirect to dashboard
                document.location = "/dashboard"

            }
            // handler error for data processing error
        }).catch(e => {
            console.log(e)
            toast.error("Platform error, please report this problem to me", {
                id: toastLoading
            }
            )
        })).catch(e => {
            toast.error(<div>
                <p>Failed to login</p><code>{"" + e}</code><p>Make sure your hostname is correct</p>
            </div>, {
                id: toastLoading
            }
            )
        })
    }

    return (
        <div className="flex w-full h-full justify-center items-center">
            <div className="flex flex-col w-100 gap-8">
                <div>
                    <h1 className=" text-pink-0 text-[32px] leading-[48px]">Welcome!</h1>
                    <h2 className=" text-[20px] leading-[30px]">Sign in to your Taiga account</h2>
                </div>
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    <div className="flex items-center gap-1 border border-purple-0 bg-purple-50 px-2 py-[10px] rounded-[4px]">
                        {HostIcon}
                        <input name="hostname" className="bg-transparent w-full" placeholder="Hostname" title="example: http://10.10.10.1:9000" type="text" value={hostname} onChange={e => setHostname(e.target.value)}></input>
                    </div>
                    <div name="username" className="flex items-center gap-1 border border-purple-0 bg-purple-50 px-2 py-[10px] rounded-[4px]">
                        {UserIcon}
                        <input className="bg-transparent w-full" placeholder="Username" type="text" value={username} onChange={e => setUsername(e.target.value)}></input>
                    </div>
                    <div name="password" className="flex items-center gap-1 border border-purple-0 bg-purple-50 px-2 py-[10px] rounded-[4px]">
                        {PasswordIcon}
                        <input className="bg-transparent w-full" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}></input>
                    </div>
                    <input type="submit" hidden />
                </form>

                <div className="flex w-full">
                    <button className="w-full bg-pink-0 text-purple-100 rounded-[4px] py-2" onClick={handleLogin}>Login</button>
                </div>
            </div>
        </div>
    );
}

const UserIcon = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_15_11)">
        <path fillRule="evenodd" clipRule="evenodd" d="M9.99999 10.8333C11.6108 10.8333 12.9167 9.52749 12.9167 7.91666C12.9167 6.30583 11.6108 4.99999 9.99999 4.99999C8.38916 4.99999 7.08332 6.30583 7.08332 7.91666C7.08332 9.52749 8.38916 10.8333 9.99999 10.8333ZM9.99999 9.58332C10.9205 9.58332 11.6667 8.83713 11.6667 7.91666C11.6667 6.99618 10.9205 6.24999 9.99999 6.24999C9.07952 6.24999 8.33332 6.99618 8.33332 7.91666C8.33332 8.83713 9.07952 9.58332 9.99999 9.58332Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M18.3333 9.99999C18.3333 14.6024 14.6024 18.3333 9.99999 18.3333C5.39762 18.3333 1.66666 14.6024 1.66666 9.99999C1.66666 5.39762 5.39762 1.66666 9.99999 1.66666C14.6024 1.66666 18.3333 5.39762 18.3333 9.99999ZM14.4097 15C13.2345 16.0373 11.6907 16.6667 9.99999 16.6667C7.98645 16.6667 6.18141 15.774 4.95901 14.3628C5.15497 14.5891 5.36592 14.802 5.59029 15C6.76552 13.9627 8.30926 13.3333 10 13.3333C11.6907 13.3333 13.2345 13.9627 14.4097 15ZM15.5125 13.7503C16.2409 12.6818 16.6667 11.3906 16.6667 9.99999C16.6667 6.31809 13.6819 3.33332 9.99999 3.33332C6.31809 3.33332 3.33332 6.31809 3.33332 9.99999C3.33332 11.3907 3.75913 12.6819 4.48747 13.7504C5.95655 12.4536 7.88638 11.6667 10 11.6667C12.1136 11.6667 14.0434 12.4535 15.5125 13.7503Z" fill="white" />
    </g>
    <defs>
        <clipPath id="clip0_15_11">
            <rect width="20" height="20" fill="white" />
        </clipPath>
    </defs>
</svg>

const PasswordIcon = <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_15_290)">
        <path d="M10 10.8333C9.53977 10.8333 9.16668 11.2064 9.16668 11.6667V13.3333C9.16668 13.7936 9.53977 14.1667 10 14.1667C10.4602 14.1667 10.8333 13.7936 10.8333 13.3333V11.6667C10.8333 11.2064 10.4602 10.8333 10 10.8333Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M14.1667 5.83332C14.1667 3.53214 12.3012 1.66666 10 1.66666C7.69882 1.66666 5.83334 3.53214 5.83334 5.83332V7.49999H5.00001C4.07954 7.49999 3.33334 8.24618 3.33334 9.16666L3.33335 15.8333C3.33335 16.7538 4.07954 17.5 5.00001 17.5H15C15.9205 17.5 16.6667 16.7538 16.6667 15.8333L16.6667 9.16666C16.6667 8.24618 15.9205 7.49999 15 7.49999H14.1667V5.83332ZM12.5 5.83332V7.49999H7.50001V5.83332C7.50001 4.45261 8.6193 3.33332 10 3.33332C11.3807 3.33332 12.5 4.45261 12.5 5.83332ZM5.00001 9.16666L5.00001 15.8333H15V9.16666H5.00001Z" fill="white" />
    </g>
    <defs>
        <clipPath id="clip0_15_290">
            <rect width="20" height="20" fill="white" />
        </clipPath>
    </defs>
</svg>

const HostIcon = <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_2_366)">
        <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 3.89543 3.89543 3 5 3H9C10.1046 3 11 3.89543 11 5V9C11 10.1046 10.1046 11 9 11H5C3.89543 11 3 10.1046 3 9V5ZM5 5H9V9H5V5Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M3 15C3 13.8954 3.89543 13 5 13H9C10.1046 13 11 13.8954 11 15V19C11 20.1046 10.1046 21 9 21H5C3.89543 21 3 20.1046 3 19V15ZM5 15H9V19H5V15Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M15 3C13.8954 3 13 3.89543 13 5V9C13 10.1046 13.8954 11 15 11H19C20.1046 11 21 10.1046 21 9V5C21 3.89543 20.1046 3 19 3H15ZM19 5H15V9H19V5Z" fill="white" />
        <path fillRule="evenodd" clipRule="evenodd" d="M13 15C13 13.8954 13.8954 13 15 13H19C20.1046 13 21 13.8954 21 15V19C21 20.1046 20.1046 21 19 21H15C13.8954 21 13 20.1046 13 19V15ZM15 15H19V19H15V15Z" fill="white" />
    </g>
    <defs>
        <clipPath id="clip0_2_366">
            <rect width="24" height="24" fill="white" />
        </clipPath>
    </defs>
</svg>



export default Login;
