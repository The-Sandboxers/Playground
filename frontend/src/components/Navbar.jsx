import { Button } from "@/components/ui/button";
import { NavLink } from "react-router";

export default function Navbar(){
    return(
        <div>
            <nav class="bg-transparent border-primary dark:bg-primary-foreground fixed z-50 top-0 left-0 w-full">
                <div class="max-w-screen flex flex-wrap items-center justify-between mx-8 p-4">
                    <span class="self-center text-2xl font-semibold whitespace-nowrap text-primary-foreground dark:text-primary">Playground</span>
                    <div>
                        <Button size="lg" variant="secondary">Log In</Button>
                    </div>
                </div>
            </nav>
        </div>
    );
}