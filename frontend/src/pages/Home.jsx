import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import landingImage from '../assets/CollageGames.png'

export default function Home() {
    return(
        <div className="container">
            <div className="image-container">
                <img src={landingImage} alt="Collage of Games"/>
            </div>
        </div>
    );
}