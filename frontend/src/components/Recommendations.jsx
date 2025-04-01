import React, { useState, useEffect } from 'react';
// Import Font Awesome icons from react-icons
import { FaAngleLeft, FaAngleRight, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa6';
import axios from 'axios';
import { requestBackend } from '../utils';

export default function Recommendations() {
  // Clicked Icons state handling
  const [clickedIcons, setClickedIcons] = useState({
    leftArrow: false,
    rightArrow: false,
    thumbUp: false,
    thumbDown: false,
  });

  function handleIconClick(icon) {
    setClickedIcons(prev => ({
      ...prev,
      [icon]: true,
    }));
  }

  useEffect(() => {
    const { leftArrow, rightArrow, thumbUp, thumbDown } = clickedIcons;
    if (leftArrow || rightArrow || thumbUp || thumbDown) {
      const timer = setTimeout(() => {
        setClickedIcons({
          leftArrow: false,
          rightArrow: false,
          thumbUp: false,
          thumbDown: false,
        });
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [clickedIcons]);

  // Function to query the new endpoint that returns multiple recommendations
  async function getGameRecommendations() {
    try {
      const response = await axios.get('http://127.0.0.1:5000/recs/load_recs', { timeout: 5000 }); // Querying the new endpoint
      return response.data;  // returns an array of games
    } catch (err) {
      console.log("Unhandled error: " + err);
      return [];
    }
  }
  async function addLikedGame(likedGameId) {
    const {success, data} = await requestBackend("POST", "http://127.0.0.1:5000/recs/liked_game", "access", likedGameId)
    try{
      if(success){
      setGameList(prevItems => prevItems.filter(game => game.igdb_id !== likedGameId));
      console.log(data)
    }
    }catch{
      console.log("Error liking games")
    }
  }

  // Handling the Carousel of games
  const [currGameData, setCurrGameData] = useState({
    name: "NOT Rocket League",
    url_cover: "https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef04986cea/EGS_RocketLeague_PsyonixLLC_S2_1200x1600-b61e9e7ec5d3294dfa514f23fc7f0684"
  });

  const [gameList, setGameList] = useState([]); // Array of game items
  const [currentIndex, setCurrentIndex] = useState(0); // Current index in the list

  async function handleArrowClick(direction) {
    if (direction === "right") {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= gameList.length) {
        const additionalItems = await getGameRecommendations(); // Get additional games if needed
        setGameList(prevItems => [...prevItems, ...additionalItems]);
      }
      setCurrentIndex(nextIndex);

    } else if (direction === "left") {
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        const additionalItems = await getGameRecommendations(); // Prepend new games if at the start
        setGameList(prevItems => [...additionalItems, ...prevItems]);
        setCurrentIndex(additionalItems.length - 1);
      } else {
        setCurrentIndex(prevIndex);
      }
    }
  }

  useEffect(() => {
    async function loadInitialGames() {
      const firstBatchOfGames = await getGameRecommendations(); // Initial set of games
      setGameList(firstBatchOfGames);
      setCurrentIndex(0);
    }
    loadInitialGames();
  }, []);

  return (
    <div className="app-container">
      <header className="header-container">
        <ProfileButton />
        <div className="header-text">
          <h1>Playground!</h1>
          <h2 id="rec-games">Recommended Games</h2>
        </div>
      </header>
      <main className="main-content">
        <SearchBar />
        <h1 className="game-title"><a href={gameList[currentIndex] ? gameList[currentIndex].url : ''}>{gameList[currentIndex] ? gameList[currentIndex].name : 'Loading...'}</a></h1>
        <div className="game-info">
          <div className="visuals-container">
            <div className="arrows-container">
              <FaAngleLeft
                className={`icon arrow-icon ${clickedIcons.leftArrow ? 'clicked' : ''}`}
                onClick={() => {handleIconClick('leftArrow'), handleArrowClick('left')}}
              />
              <div className="image-container">
                <img
                  src={gameList[currentIndex] ? gameList[currentIndex].cover_url : null}
                  alt={gameList[currentIndex] ? gameList[currentIndex].cover : null}
                  className="game-cover"
                />
              </div>

              <FaAngleRight
                className={`icon arrow-icon ${clickedIcons.rightArrow ? 'clicked' : ''}`}
                onClick={() => {handleIconClick('rightArrow'), handleArrowClick('right')}}
              />
            </div>
            <div className="thumbs-container">
              <FaRegThumbsUp
                className={`icon thumb-icon ${clickedIcons.thumbUp ? 'clicked' : ''}`}
                id="thumb-up"
                onClick={() => {
                  handleIconClick('thumbUp'),
                  addLikedGame(gameList[currentIndex].igdb_id);
                }}
              />
              <FaRegThumbsDown
                className={`icon thumb-icon ${clickedIcons.thumbDown ? 'clicked' : ''}`}
                id="thumb-down"
                onClick={() => handleIconClick('thumbDown')}
              />
            </div>
          </div>
          <div className="text-container">
            <span className="rating-container">
              <h3>Rating: {gameList[currentIndex] ? (gameList[currentIndex].aggregated_rating / 10).toFixed(2) : 'Loading...'}/10</h3>
            </span>
            <div className="summary-container">
              <p>{gameList[currentIndex] ? gameList[currentIndex].summary : ''}</p>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div>Copyright &copy; 2025 Sandboxers</div>
      </footer>
    </div>
  );
}
