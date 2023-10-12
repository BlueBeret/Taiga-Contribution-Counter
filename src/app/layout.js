import './globals.css'
import { Poppins } from 'next/font/google'
import { Toaster } from "react-hot-toast";
const poppins = Poppins({ subsets: ['latin'], weight: ["400", "700"] })

export const metadata = {
  title: 'Taiga Point Counter',
  description: 'Calculate your contributions to Taiga projects',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`flex h-screen w-screen bg-purple-100 text-white ${poppins.className}`}>{children}
        <Toaster
          position='top-center'
        ></Toaster>
      </body>

    </html>
  )
}
