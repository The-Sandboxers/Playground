import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import RegistrationForm from '../components/RegistrationForm';
import useModalControls from '../components/custom-hooks/useModalControls';

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false)

    useModalControls(isModalOpen, setIsModalOpen);

    return(
        <div className="mx-auto min-h-screen">  
            <Navbar/>
            <div className="bg-[url('/public/CollageGames.png')] bg-cover bg-center w-screen h-screen bg-fixed relative">
                <div className="absolute inset-0 bg-foreground opacity-30"></div>
                <div className="flex flex-col items-center justify-center h-full backdrop-blur-xs">
                    <div className="flex flex-col relative z-10 text-primary-foreground text-6xl font-black">
                        <div className="m-8">
                            <h1>Playground</h1>
                        </div>
                        
                        <div className="flex items-center justify-center">
                            <Button size="lg" onClick={() => setIsModalOpen(true)}>Sign Up Now!</Button>
                        </div>
                        
                    </div>
                </div>
                
            </div>
            {/* On modal open, darkens screen and disables scrolling, user can click off or hit escape to close modal */}
            {/* If you want to reuse this code, make sure to put it OUTSIDE of any relative block or it won't properly darken the screen*/}
            {isModalOpen && (<div className="fixed top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-primary/80" 
                onClick={() => setIsModalOpen(false)}>
                        <div onClick={(e) => e.stopPropagation()}> 
                            <RegistrationForm/>
                        </div>
                    </div>
                )}
            <Footer/>
        </div>
    );
}