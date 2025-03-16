import { Button } from "@/components/ui/button";
import { NavLink } from "react-router";
import { LoginForm } from "./LoginForm";
import { useState } from "react";
import useModalControls from "./custom-hooks/useModalControls";


export default function HomeNavbar(){
    const [isModalOpen, setIsModalOpen] = useState(false)

    useModalControls(isModalOpen, setIsModalOpen);


    return(
        <div>
            <nav className="bg-transparent border-background fixed z-10 top-0 left-0 w-full">
                <div className="max-w-screen flex flex-wrap items-center justify-between mx-8 p-4">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-primary-foreground dark:text-primary">Playground</span>
                    <div >
                        <Button size="lg" variant="secondary" className="font-black text-md" onClick={() => setIsModalOpen(true)}>Log In</Button>
                    </div>
                </div>
            </nav>
            {/* On modal open, darkens screen and disables scrolling, user can click off or hit escape to close modal */}
            {isModalOpen && (<div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-primary/80" 
            onClick={() => setIsModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()}> 
                        <LoginForm/>
                    </div>
                </div>
            )}
        </div>
    )
}