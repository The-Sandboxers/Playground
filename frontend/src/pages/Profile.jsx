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
    const [platforms, setPlatforms] = useState({
        PC_Windows: false,
        PlayStation_5: false,
        Xbox_Series_X_S: false,
        PlayStation_4: false,
        Xbox_One: false,
        Linux: false,
        Mac: false,
        Nintendo_Switch: false
    })


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
                    setPlatforms(data.platforms);
                    console.log(data.platforms)
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

    async function handleCheckboxChange(platformKey, isChecked) {
        const updatedPlatforms = { ...platforms, [platformKey]: isChecked };
        setPlatforms(updatedPlatforms);
        const params = {'platforms': updatedPlatforms};
        const {success, response} = await requestBackend('POST', 'http://127.0.0.1:5000/profile/edit_platforms', 'access', params);
        if (success) {
            console.log('Checkbox POST Success:', response);
        } else {
            console.error('Checkbox POST Error:', response);
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

                {/* Start of Checkbox */}
                <h3 className="mb-4 mt-12 font-semibold text-white">Platforms</h3>
                <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="windows-checkbox"
                        type="checkbox"
                        checked={platforms.PC_Windows}
                        onChange={(e) => handleCheckboxChange('PC_Windows', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="windows-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Windows
                    </label>
                    </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="ps5-checkbox"
                        type="checkbox"
                        checked={platforms.PlayStation_5}
                        onChange={(e) => handleCheckboxChange('PlayStation_5', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="ps5-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Playstation 5
                    </label>
                    </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="xbox-series-checkbox"
                        type="checkbox"
                        checked={platforms.Xbox_Series_X_S}
                        onChange={(e) => handleCheckboxChange('Xbox_Series_X_S', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="xbox-series-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Xbox Series X
                    </label>
                    </div>
                </li>
                <li className="w-full dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="ps4-checkbox"
                        type="checkbox"
                        checked={platforms.PlayStation_4}
                        onChange={(e) => handleCheckboxChange('PlayStation_4', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="ps4-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Playstation 4
                    </label>
                    </div>
                </li>
                </ul>
                <ul className="items-center w-full mt-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="xbox-one-checkbox"
                        type="checkbox"
                        checked={platforms.Xbox_One}
                        onChange={(e) => handleCheckboxChange('Xbox_One', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="xbox-one-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Xbox One
                    </label>
                    </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="linux-checkbox"
                        type="checkbox"
                        checked={platforms.Linux}
                        onChange={(e) => handleCheckboxChange('Linux', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="linux-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Linux
                    </label>
                    </div>
                </li>
                <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="mac-checkbox"
                        type="checkbox"
                        checked={platforms.Mac}
                        onChange={(e) => handleCheckboxChange('Mac', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="mac-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Mac
                    </label>
                    </div>
                </li>
                <li className="w-full dark:border-gray-600">
                    <div className="flex items-center ps-3">
                    <input
                        id="nintendo-switch-checkbox"
                        type="checkbox"
                        checked={platforms.Nintendo_Switch}
                        onChange={(e) => handleCheckboxChange('Nintendo_Switch', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <label htmlFor="nintendo-switch-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                        Nin. Switch
                    </label>
                    </div>
                </li>
                </ul>
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