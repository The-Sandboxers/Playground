import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Home.css'

export default function Home() {
    return(
        <div className="container mx-auto">
            <div className="bg-home-background">
                <h1>Playground!</h1>
                <div className="">
                    <h3>
                        Start Finding Games!
                    </h3>
                </div>
            </div>
        </div>
    );
}