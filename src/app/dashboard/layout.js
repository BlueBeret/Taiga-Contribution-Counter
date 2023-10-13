import '../globals.css'
import { Metal_Mania, Poppins } from 'next/font/google'
import { Toaster } from "react-hot-toast";
import { headers } from 'next/headers';
import Header from './Header';

export const metadata = {
    title: 'Taiga Point Counter',
    description: 'Calculate your contributions to Taiga projects',
    icons: {
        icon: '/favicon.ico',
    }
}

export default function RootLayout({ children }) {
    // get current path
    const headersList = headers();
    const domain = headersList.get('host') || "";
    const fullUrl = headersList.get('referer') || "";
    console.log(fullUrl);
    return (<div className='flex flex-col w-full h-full'>
        <Header path={fullUrl}></Header>
        <div className='w-screen'
            style={{
                // height is 100% - 64px (header height)
                maxHeight: 'calc(100vh - 64px)'
        }}    
        >
            {children}
        </div>
        <Toaster
            position='top-center'
        ></Toaster>
    </div>
    )
}

