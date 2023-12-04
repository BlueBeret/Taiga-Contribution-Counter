import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from "react-hot-toast";
import { Analytics } from '@vercel/analytics/react';
const poppins = Poppins({ subsets: ['latin'], weight: ["400", "700"] })


export const metadata = {
  title: 'Taiga Point Counter',
  description: 'Calculate your contributions to Taiga projects',
  icons: {
    icon: '/favicon.ico',
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/images/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest"></link>
      </head>
      <body className={`flex h-screen w-screen overflow-x-hidden bg-purple-100 text-white ${poppins.className}`}>{children}
        <Toaster
          position='top-center'
        ></Toaster>
        <Analytics/>
      </body>

    </html>
  )
}
