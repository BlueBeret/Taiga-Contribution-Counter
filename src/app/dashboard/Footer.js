'use client'
import Link from "next/link";
import { useEffect } from "react";
export default function Footer() {

    const developer = <div id="lurifos1337" className="flex flex-col justify-center items-center">
        <span>Made with 💜 by <Link className=" text-pink-0 font-bold" href="https://lurifos.dev">Lurifos</Link></span>
    </div>
    const designer = <div id="urdhun" className="hidden flex-col justify-center items-center">
        <span>Lovely designed by <Link className=" text-pink-0 font-bold" href="#">Urdhun</Link></span>
    </div>

    useEffect(() => {
        const interval = setInterval(() => {
            if (document.getElementById("lurifos1337").style.display === "none") {
                document.getElementById("lurifos1337").style.display = "flex";
                document.getElementById("urdhun").style.display = "none";
            } else {
                document.getElementById("lurifos1337").style.display = "none";
                document.getElementById("urdhun").style.display = "flex";
            }
        }, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <footer id="footer" className="flex flex-col w-full justify-center items-center px-8 py-[18px] gap-1 bg-purple-50 floor
             text-sm
        "> {developer}
            {designer}
        </footer>
    );
}