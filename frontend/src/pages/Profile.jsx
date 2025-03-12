import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { requestBackend } from '../utils';

export default function Profile()
{
    const [username, setUsername] = useState('Guest');
    const [profilePic, setProfilePic] = useState("https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/420/420/Hat/Png");
    const [likedGames, setLikedGames] = useState("");
    const [playedGames, setPlayedGames] = useState("");


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await requestBackend("GET", "http://127.0.0.1:5000/profile");
                console.log(ImageData)
                setUsername(data.username);
                setLikedGames(data.liked_games);
                setPlayedGames(data.all_games);
            } catch (error) {
                console.log(error);
            }
        };

        fetchProfile();
    }, []);

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
                </div>
            </div>
        </div>
      );
}
