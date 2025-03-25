import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { requestBackend } from '../utils';
import { Button } from "@/components/ui/button";

export default function Profile()
{
    const navigate = useNavigate();
    const [username, setUsername] = useState('Guest');
    const [profilePic, setProfilePic] = useState("https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/420/420/Hat/Png");
    const [likedGames, setLikedGames] = useState("");
    const [playedGames, setPlayedGames] = useState("");


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const {success, data} = await requestBackend("GET", "http://127.0.0.1:5000/profile");
                if (success){
                    console.log(data)
                    setUsername(data.username);
                    setLikedGames(data.liked_games);
                    setPlayedGames(data.all_games);
                }
                
            } catch (error) {
                console.log(error);
            }
        };

        fetchProfile();
    }, []);

    async function signOut() {
        const {success, data} = await requestBackend("DELETE", "http://127.0.0.1:5000/logout");
        if (success) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/");
        }
    }

    return (
        <div className="mt-18 grid grid-flow-col grid-rows-3 grid-cols-5 gap-4 p-5 font-black text-gray-200 text-lg">
            <div className="col-span-2 row-span-3 rounded-lg bg-card-foreground p-5">
                <h3>{username}</h3>
                <img src={profilePic} className="rounded-full mx-auto"></img>
                
                <Button size="lg" variant="secondary" className="font-black text-md" onClick={signOut}>Sign Out</Button>
                <h3>Linked Services:</h3>
            </div>
            <div className="col-span-3 rounded-lg bg-foreground p-5">
                <h3>Played Games</h3>
                <p>{playedGames}</p>
            </div>
            <div className="col-span-3 rounded-lg bg-foreground p-5">
                <h3>Liked Games</h3>
                <p>{likedGames}</p>
            </div>
        </div>
      );
}
