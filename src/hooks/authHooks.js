import { useEffect, useState } from "react";
export function useCheckUser(params) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const user = localStorage.getItem("taiga_user",);
        if (user) {
            setUser(JSON.parse(user));
        } else {
            document.location = "/login";
        }

    }, []);

    useEffect(() => {
        if (user && isLoading) {
            let domain = new URL(user.photo);
            domain = domain.origin;

            // check if token is valid
            fetch(domain + "/api/v1/users/me", {
                headers: {
                    Authorization: `Bearer ${user.auth_token}`,
                },
                method: "GET",
            })
                .then((resp) => {
                    // if response is not ok, remove user from localstorage
                    if (resp.ok) {
                        resp.json().then((data) => {
                            setIsLoading(false);
                        });
                    } else {
                        console.log("no user in check", resp)
                        localStorage.removeItem("taiga_user");
                        document.location = "/login";
                    } 
                })
                .catch((err) => {
                    localStorage.removeItem("taiga_user");
                    // redirect to login
                    document.location = "/login";
                });
        }
    }, [user, isLoading])

    if (isLoading) {
        return null;
    } else {
        return user;
    }

}