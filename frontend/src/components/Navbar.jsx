import { Button } from "@/components/ui/button";
import { NavLink } from "react-router";
import { LoginForm } from "@/components/login-form";
import { useState, useEffect } from "react";


export default function Navbar(){
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Disable scroll when modal is open
    useEffect(() => {
        if (isModalOpen) {
            document.documentElement.style.overflow = "hidden";
        } else {
            document.documentElement.style.overflow = "scroll";
        }

        // Cleanup function to reset scroll when component unmounts or modal closes
        return () => {
            document.documentElement.style.overflow = "hidden";
        };
    }, [isModalOpen])

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                setIsModalOpen(false);
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);


    return(
        <div>
            <nav className="bg-transparent border-primary dark:bg-primary-foreground fixed z-10 top-0 left-0 w-full">
                <div className="max-w-screen flex flex-wrap items-center justify-between mx-8 p-4">
                    <span className="self-center text-2xl font-semibold whitespace-nowrap text-primary-foreground dark:text-primary">Playground</span>
                    <div >
                        <Button size="lg" variant="secondary" onClick={() => setIsModalOpen(true)}>Log In</Button>
                    </div>
                </div>
            </nav>
            {isModalOpen && (<div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center" 
            onClick={() => setIsModalOpen(false)}>
                    <div onClick={(e) => e.stopPropagation()}> 
                        <LoginForm/>
                    </div>
                </div>
            )}
        </div>
    )
}