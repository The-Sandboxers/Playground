import React, { useState, useEffect } from 'react';
// Import Font Awesome icons from react-icons
import { FaAngleLeft, FaAngleRight, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa6';
import './Recomendations.css';
import axios from 'axios'

export default function Recomendations() {
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

  const [currGameData, setCurrGameData] = useState({
    title: "Rocket League",
    url_cover: "https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef04986cea/EGS_RocketLeague_PsyonixLLC_S2_1200x1600-b61e9e7ec5d3294dfa514f23fc7f0684"
  });

  useEffect(() => {
    // Gets game data
    axios.get(
            'http://127.0.0.1:5000/hard_coded_game'
          )
          .then((response) => {
            setCurrGameData(response.data)
          })
          .catch((err) => {console.log("Unhandled error" + err)})
  }, [clickedIcons]); // This dependency needs to change... later

  return (
    <div className="app-container">
      <header className="page-title-container">
        <h1>Playground!</h1>
        <h2 id="rec-games">Recommended Games</h2>
      </header>

      <main className="main-content">
        <h1 className="game-title">{currGameData.title}</h1>
        <div className="game-info">
          <div className="visuals-container">
            <div className="arrows-container">
              <FaAngleLeft
                className={`icon arrow-icon ${clickedIcons.leftArrow ? 'clicked' : ''}`}
                onClick={() => handleIconClick('leftArrow')}
              />

              <div className="image-container">
                <img
                  src={currGameData.url_cover}
                  alt="Game Cover"
                  className="game-cover"
                />
              </div>

              <FaAngleRight
                className={`icon arrow-icon ${clickedIcons.rightArrow ? 'clicked' : ''}`}
                onClick={() => handleIconClick('rightArrow')}
              />
            </div>
            <div className="thumbs-container">
              <FaRegThumbsUp
                className={`icon thumb-icon ${clickedIcons.thumbUp ? 'clicked' : ''}`}
                id="thumb-up"
                onClick={() => handleIconClick('thumbUp')}
              />
              <FaRegThumbsDown
                className={`icon thumb-icon ${clickedIcons.thumbDown ? 'clicked' : ''}`}
                id="thumb-down"
                onClick={() => handleIconClick('thumbDown')}
              />
            </div>
          </div>
          <div class="text-container">
            <div class="summary-container">
              <p>Rocket League is a video game the combines arcade-style soccer and driving games. You play by controlling rocket-powered vehicles, which you can use to score goals with a giant soccer ball. Gameplay is energetic and chaotic as the cars can flip and fly in all directions.<br /><br />

Rocket League supports single player, multiplayer and cross-platform play. Online players are teamed up by the game’s matchmaking system. You can play casually or take part in the online Competitive Seasons to climb the ranks and earn rewards.<br /><br />

Players can communicate by voice or text on the same platform, or by pre-set messages called Quick Chats, which are visible to everyone. Rocket League players may also use third-party voice chat apps like Discord.</p>
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
