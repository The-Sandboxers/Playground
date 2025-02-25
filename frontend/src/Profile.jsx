import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

export default function Profile()
{
    const [username, setUsername] = useState('Guest');
    const [profilePic, setProfilePic] = useState("https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/420/420/Hat/Png");
    const [likedGames, setLikedGames] = useState("");
    const [playedGames, setPlayedGames] = useState("");


    async function refreshProfile()
    {
        try {
            const response = await axios.get('http://127.0.0.1:5000/profile');
            setUsername(response.data.username);
            setProfilePic(response.data.profile_pic);
        } catch (error) {
            
        }
        
    }

    return (
        <div className="profile-container">
            <div className="horizontal-layout">
                <div className="pic-and-linked-accounts">
                    <h3>{username}</h3>
                    <img src={profilePic} className="profile-pic"></img>
                    <h3>Linked Services:</h3>
                </div>
                <div className="vertical-layout">
                    <div className="played-games">
                        <h3>Played Games</h3>
                        <p>{playedGames}</p>
                    </div>
                    <div className="liked-games">
                        <h3>Liked Games</h3>
                        <p>{likedGames}</p>
                    </div>
                    <button onClick={refreshProfile}></button>
                </div>
            </div>
        </div>
      );
}
