import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
    return(
        <div className="mx-auto min-h-screen">
            <Navbar/>
            <div className="bg-[url('/public/CollageGames.png')] bg-cover bg-center w-screen h-screen bg-fixed relative">
                <div className="absolute inset-0 bg-foreground opacity-50"></div>
                <div className="flex flex-col items-center justify-center h-full backdrop-blur">
                    <div className="flex flex-col relative z-10 text-primary-foreground text-6xl font-black">
                        <div className="m-8">
                            <h1>Playground</h1>
                        </div>
                        
                        <div className="flex items-center justify-center">
                            <Button size="lg">Sign Up Now!</Button>
                        </div>
                        
                    </div>
                </div>
                
            </div>
            <Footer/>
        </div>
    );
}