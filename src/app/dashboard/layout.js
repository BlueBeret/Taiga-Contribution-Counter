import '../globals.css'
import { Metal_Mania, Poppins } from 'next/font/google'
import { Toaster } from "react-hot-toast";
import { headers } from 'next/headers';
import Header from './Header';
import Footer from './Footer';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import GoogleAnalytics from '../GoogleAnalytics';

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
        {/* <Script src="https://cdn.counter.dev/script.js" data-id="a441cb5b-1922-4da1-aaa8-0b1b471180cf" data-utcoffset="7"></Script> */}
        <Header path={fullUrl}></Header>
        <div className='w-screen'
            style={{
                height: "calc(100vh - 68px)"
            }}
        >
            {children}
        </div>
        <Footer></Footer>
        <Toaster
            position='top-center'
        ></Toaster>
        <Analytics />
        <SpeedInsights />
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />}
    </div>
    )
}

