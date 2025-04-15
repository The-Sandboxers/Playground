import React, { useState, useEffect } from 'react';
import { FaRegThumbsUp, FaRegThumbsDown, FaXmark } from 'react-icons/fa6';
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
    const [hasSteamID, setHasSteamID] = useState(false);


    useEffect(() => {
        const handleSteamCallback = async () => {
            // Only handle Steam OpenID if login was initiated from this tab
            if (sessionStorage.getItem("steamLoginStarted") !== "true") return;
    
            // Clear the flag immediately to prevent re-runs
            sessionStorage.removeItem("steamLoginStarted");
    
            const params = new URLSearchParams(window.location.search);
            const claimedId = params.get("openid.claimed_id");
            const openidMode = params.get("openid.mode");
            const openidSig = params.get("openid.sig");
    
            if (claimedId && openidMode === "id_res" && openidSig) {
                try {
                    const { success, data } = await requestBackend(
                        "POST",
                        "http://127.0.0.1:5000/profile/steam/callback",
                        "access",
                        { steamId: claimedId, openidMode, openidSig }
                    );
    
                    if (success) {
                        await requestBackend("POST", "http://127.0.0.1:5000/profile/load_games_steam");
                        setHasSteamID(true);
                        // Clean up the URL
                        window.history.replaceState({}, document.title, window.location.pathname);
                    }
                } catch (error) {
                    console.error("Steam OpenID callback failed:", error);
                }
            }
        };
    
        handleSteamCallback();
    }, []);
    
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
                    setHasSteamID(data.steam_id_exists);
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

    async function steamToggle() {
        // If they have steam it removes it, if they don't have steam then it connects them to steam
        if (!hasSteamID) {
            try {
                await steamAuth()
            } catch (error) {
                console.log(error);
            }
        } else {
            console.log('removing steam')
            const {success, code} = await requestBackend("DELETE", "http://127.0.0.1:5000/profile/remove_steam_id");
            console.log(code);
            if(success){
                setHasSteamID(false);
            }
        }
    }

    async function removePlayedGame(gameData, index) {
        try {
            const data = {"played_game_id": gameData.igdb_id};
            const {success, response} = await requestBackend("POST", "http://127.0.0.1:5000/recs/remove_played_game", "access", data);
            if (success) {
                likedGamesData.removeItem(index)
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function likeGame(gameData) {
        try {
            const data = {"liked_game_id": gameData.igdb_id};
            const {success, message} = await requestBackend("POST", "http://127.0.0.1:5000/recs/liked_game", "access", data);
            if (success) {

            }
        } catch (error) {
            console.log(error)
        }
    }

    async function dislikeGame(gameData) {
        try {
            const data = {"disliked_game_id": gameData.igdb_id};
            const {success, response} = await requestBackend("POST", "http://127.0.0.1:5000/recs/disliked_game", "access", data);
            if (success) {

            }
        } catch (error) {
            console.log(error)
        }
    }


    return (
        <div className="grid grid-flow-col grid-rows-3 grid-cols-5 gap-4 p-5 font-black text-gray-200 text-2xl">
            <div className="col-span-2 row-span-3 rounded-lg bg-card-foreground p-5">
                <h3>{username}</h3>
                <img src={profilePic} className="rounded-full mx-auto" />
                
                <Button size="lg" variant="secondary" className="font-black text-md mb-4" onClick={signOut}>Sign Out</Button>
                <h3 className="mb-4">Linked Services:</h3>
                <Button size="lg" variant="secondary" className="font-black text-md mb-4" onClick={steamToggle}>{hasSteamID ? 'Disconnect from Steam' : 'Connect to Steam'}</Button>
            </div>
            <div className="col-span-3 rounded-lg bg-foreground p-5">
                <p className="mb-4">Played Games</p>
                <div className="h-72 overflow-auto">  {/* Fixed height for the container */}
                    <div className="grid grid-cols-6 gap-4">
                        {/* Need to check if the played games length has at least length 1 */}
                        {playedGames.length ? (playedGamesData.map((element, index) => (
                            <div key={index} className="relative group flex-shrink-0 w-32 h-43">  {/* Fixed width and height for images */}
                                <a href={element.url} target="_blank">
                                <img src={element.cover_url} alt={`Game cover ${index}`} className="object-cover w-full h-full rounded-md" />
                                </a>
                                <FaXmark className="absolute top-2 left-2 hidden group-hover:block bg-red-500 text-white px-2 py-1 rounded-md text-2xl cursor-pointer" onClick={() => removePlayedGame(element, index)} title="Remove game"/>
                                <FaRegThumbsDown className="absolute bottom-2 left-2 hidden group-hover:block bg-red-500 text-white px-2 py-1 rounded-md text-3xl cursor-pointer" onClick={() => dislikeGame(element)} title="Dislike game"/>
                                <FaRegThumbsUp className="absolute bottom-2 right-2 hidden group-hover:block bg-green-500 text-white px-2 py-1 rounded-md text-3xl cursor-pointer" onClick={() => likeGame(element)} title="Like game"/>
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
                                <img src={element.cover_url} alt={`Game cover ${index}`} className="object-cover w-full h-full rounded-md" />
                            </div>
                        ))) : <div></div>}
                    </div>
                </div>
            </div>
        </div>
      );
}
