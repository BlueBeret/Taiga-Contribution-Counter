// redirect to dashboard
"use client";
export const dynamic = 'force-dynamic'
import { useEffect } from "react"

export default function Home() { 
  useEffect(() => {
    document.location = "/dashboard"
  })
  return <>
  </>
}

