import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { requestBackend, steamAuth, redirectBack } from '../utils';
import { Button } from "@/components/ui/button";

export default function Profile()
{
    const navigate = useNavigate();
    const [username, setUsername] = useState('Guest');
    const [profilePic, setProfilePic] = useState("https://tr.rbxcdn.com/38c6edcb50633730ff4cf39ac8859840/420/420/Hat/Png");
    const [likedGames, setLikedGames] = useState("");
    const [playedGames, setPlayedGames] = useState("");
    const [playedGamesData, setPlayedGamesData] = useState([]);
    const [likedGamesData, setLikedGamesData] = useState([]);


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const {success, data} = await requestBackend("GET", "http://127.0.0.1:5000/profile");
                console.log(data)
                if (success){
                    setUsername(data.username);
                    setLikedGames(data.liked_games);
                    setPlayedGames(data.played_games);
                    setPlayedGamesData(data.played_games_sources);
                    setLikedGamesData(data.liked_games_sources);
                }
                
            } catch (error) {
                console.log(error);
            }
        };

        fetchProfile();
    }, []);

    async function signOut() {
        try {
            const {success, data} = await requestBackend("DELETE", "http://127.0.0.1:5000/logout");
            if (success) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate("/");
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function steamAuthenticate() {
        try {
            await steamAuth()
            await redirectBack()
            const{success,data} = await requestBackend("POST", "http://127.0.0.1:5000/profile/load_games_steam")
    
        } catch (error) {
            console.log(error);
        }
    }


    return (
        <div className="mt-18 grid grid-flow-col grid-rows-3 grid-cols-5 gap-4 p-5 font-black text-gray-200 text-2xl">
            <div className="col-span-2 row-span-3 rounded-lg bg-card-foreground p-5">
                <h3>{username}</h3>
                <img src={profilePic} className="rounded-full mx-auto" />
                
                <Button size="lg" variant="secondary" className="font-black text-md mb-4" onClick={signOut}>Sign Out</Button>
                <h3 className="mb-4">Linked Services:</h3>
                <Button size="lg" variant="secondary" className="font-black text-md mb-4" onClick={steamAuthenticate}>Connect to Steam</Button>
            </div>
            <div className="col-span-3 rounded-lg bg-foreground p-5">
                <p className="mb-4">Played Games</p>
                <div className="h-72 overflow-auto">  {/* Fixed height for the container */}
                    <div className="grid grid-cols-6 gap-4">
                        {/* Need to check if the played games length has at least length 1 */}
                        {playedGames.length ? (playedGamesData.map((element, index) => (
                            <div key={index} className="flex-shrink-0 w-32 h-43">  {/* Fixed width and height for images */}
                                <a href={element.url} target="_blank">
                                <img src={element.cover_url} alt={`Game cover ${index}`} className="object-cover w-full h-full rounded-md" />
                                </a>
                            </div>
                        ))) : <div></div>}
                    </div>
                </div>
            </div>
            <div className="col-span-3 rounded-lg bg-foreground p-5">
                <p className="mb-4">Liked Games</p>
                <div className="h-72 overflow-auto">  {/* Fixed height for the container */}
                    <div className="grid grid-cols-6 gap-4">
                        {/* Need to check if the liked games length has at least length 1 */}
                        {likedGames.length ? (likedGamesData.map((element, index) => (
                            <div key={index} className="flex-shrink-0 w-32 h-43">  {/* Fixed width and height for images */}
                                <a href={element.url} target="_blank">
                                    <img src={element.cover_url} alt={`Game cover ${index}`} className="object-cover w-full h-full rounded-md" />
                                </a>
                            </div>
                        ))) : <div></div>}
                    </div>
                </div>
            </div>
        </div>
      );
}
