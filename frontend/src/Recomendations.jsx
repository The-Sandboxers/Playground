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
    name: "NOT Rocket League",
    url_cover: "https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef04986cea/EGS_RocketLeague_PsyonixLLC_S2_1200x1600-b61e9e7ec5d3294dfa514f23fc7f0684"
  });

  useEffect(() => {
    // Gets game data
    axios.get(
            'http://127.0.0.1:5000/gameinfo/example_game'
          )
          .then((response) => {
            setCurrGameData(response.data.result.hits.hits[0]._source);
            console.log(currGameData);
          })
          .catch((err) => {console.log("Unhandled error" + err)})
  }, [clickedIcons]); // This dependency needs to change... later

  return (
    <div className="app-container">
      <header className="header-container">
        <h1>Playground!</h1>
        <h2 id="rec-games">Recommended Games</h2>
      </header>

      <main className="main-content">
        <h1 className="game-title"><a href={currGameData.url}>{currGameData.name}</a></h1>
        <div className="game-info">
          <div className="visuals-container">
            <div className="arrows-container">
              <FaAngleLeft
                className={`icon arrow-icon ${clickedIcons.leftArrow ? 'clicked' : ''}`}
                onClick={() => handleIconClick('leftArrow')}
              />

              <div className="image-container">
                <img
                  src="https://cdn1.epicgames.com/offer/9773aa1aa54f4f7b80e44bef04986cea/EGS_RocketLeague_PsyonixLLC_S2_1200x1600-b61e9e7ec5d3294dfa514f23fc7f0684"
                  alt={currGameData.cover}
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
          <div className="text-container">
            <span className="rating-container">
              <h3>Rating: {(currGameData.aggregated_rating / 10).toFixed(2)}/10</h3>
            </span>
            <div className="summary-container">
              <p>{currGameData.summary}</p>
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
