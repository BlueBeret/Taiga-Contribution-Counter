'use client';

import { usePathname } from "next/navigation";
const Header = (params) => {
    const path = usePathname();
    const menus = [
        {
            name: "Leaderboard",
            icon: LeaderboardIcon,
        },
        {
            name: "User",
            icon: UserIcon,
        },
        {
            name: "Project",
            icon: FolderIcon,
        }
    ]

    return <div className='flex w-full px-8 py-[18px] gap-4 bg-purple-50'>
        <span className='w-40 font-bold text-2xl'>Taiga</span>
        {menus.map(menu => {
            let textColor = path.includes(menu.name.toLowerCase()) ? "text-pink-0" : "text-pink-100"
            return <div key={menu.name} onClick={(e) => document.location = "/dashboard/" + menu.name.toLowerCase()} className={`${textColor} flex gap-2 items-center text-[18px] cursor-pointer hover:text-pink-0`}>
                <span>{menu.icon}</span>
                <span className="font-bold">{menu.name}</span>
            </div>
        })}
        <button className="text-white ml-auto" onClick={(e) => { localStorage.clear(); document.location = "/login" }}>{LogoutIcon}</button>
    </div>
}

const LeaderboardIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 11C5 10.4477 5.44772 10 6 10H8C8.55228 10 9 10.4477 9 11V19H5V11Z" fill="currentColor" />
    <path d="M10 6C10 5.44772 10.4477 5 11 5H13C13.5523 5 14 5.44772 14 6V19H10V6Z" fill="currentColor" />
    <path d="M15 14C15 13.4477 15.4477 13 16 13H18C18.5523 13 19 13.4477 19 14V19H15V14Z" fill="currentColor" />
</svg>

const UserIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_24_363)">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 13C13.933 13 15.5 11.433 15.5 9.5C15.5 7.567 13.933 6 12 6C10.067 6 8.5 7.567 8.5 9.5C8.5 11.433 10.067 13 12 13ZM12 11.5C13.1046 11.5 14 10.6046 14 9.5C14 8.39543 13.1046 7.5 12 7.5C10.8954 7.5 10 8.39543 10 9.5C10 10.6046 10.8954 11.5 12 11.5Z" fill="currentColor" />
        <path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM17.2917 18C15.8814 19.2447 14.0289 20 12 20C9.58375 20 7.4177 18.9288 5.95082 17.2354C6.18598 17.5069 6.43912 17.7624 6.70837 18C8.11863 16.7553 9.97112 16 12 16C14.0289 16 15.8814 16.7553 17.2917 18ZM18.615 16.5004C19.489 15.2182 20 13.6688 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.6688 4.51097 15.2182 5.38498 16.5004C7.14787 14.9443 9.46367 14 12 14C14.5364 14 16.8521 14.9443 18.615 16.5004Z" fill="currentColor" />
    </g>
    <defs>
        <clipPath id="clip0_24_363">
            <rect width="24" height="24" fill="white" />
        </clipPath>
    </defs>
</svg>

const FolderIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_24_368)">
        <path fillRule="evenodd" clipRule="evenodd" d="M20 8H4V18H20V8ZM2 6V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6L12 6L10 4H4L2 6Z" fill="currentColor" />
    </g>
    <defs>
        <clipPath id="clip0_24_368">
            <rect width="24" height="24" fill="white" />
        </clipPath>
    </defs>
</svg>

const LogoutIcon = <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0_24_373)">
        <path d="M15.9375 14.8125C15.6268 15.1231 15.6268 15.6268 15.9375 15.9375C16.2482 16.2481 16.7518 16.2481 17.0625 15.9375L20.2929 12.7071C20.6834 12.3165 20.6834 11.6834 20.2929 11.2929L17.0625 8.06248C16.7519 7.75182 16.2482 7.75182 15.9375 8.06248C15.6269 8.37314 15.6269 8.87682 15.9375 9.18748L17.75 11H11C10.4477 11 9.99999 11.4477 9.99999 12C9.99999 12.5522 10.4477 13 11 13H17.75L15.9375 14.8125Z" fill="white" />
        <path d="M11 20C11 20.5523 10.5523 21 10 21L4 21C3.44771 21 3 20.5523 3 20L3 4C3 3.44772 3.44772 3 4 3L10 3.00002C10.5523 3.00002 11 3.44773 11 4.00001C11 4.55229 10.5523 5 10 5H5V19H10C10.5523 19 11 19.4477 11 20Z" fill="white" />
    </g>
    <defs>
        <clipPath id="clip0_24_373">
            <rect width="24" height="24" fill="white" />
        </clipPath>
    </defs>
</svg>


export default Header