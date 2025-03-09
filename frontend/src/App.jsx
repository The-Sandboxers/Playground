import React, { useState, useEffect } from 'react';
// Import Font Awesome icons from react-icons
import { FaArrowLeft, FaArrowRight, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import './styles/global.css'

export default function App() {
  // Combine all icon states into one object
  const [clickedIcons, setClickedIcons] = useState({
    leftArrow: false,
    rightArrow: false,
    thumbUp: false,
    thumbDown: false,
  });

  // Single function to handle any icon click
  function handleIconClick(icon) {
    setClickedIcons((prev) => ({
      ...prev,
      [icon]: true,
    }));
  }

  // Single useEffect to reset all after 200ms if any are true
  useEffect(() => {
    const { leftArrow, rightArrow, thumbUp, thumbDown } = clickedIcons;
    // If any icon is clicked, trigger a timer
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

  return (
    <div className="app-container">
      <div className="page-title-container">
        <h1>Playground!</h1>
      </div>
      <h1 className="game-title">Your Game Title</h1>

      <div className="arrows-container">
        <FaArrowLeft
          className={`icon arrow-icon ${clickedIcons.leftArrow ? 'clicked' : ''}`}
          onClick={() => handleIconClick('leftArrow')}
        />

        <div className="image-container">
          <img
            src="https://via.placeholder.com/300x400?text=Game+Cover"
            alt="Game Cover"
            className="game-cover"
          />
        </div>

        <FaArrowRight
          className={`icon arrow-icon ${clickedIcons.rightArrow ? 'clicked' : ''}`}
          onClick={() => handleIconClick('rightArrow')}
        />
      </div>

      <div className="thumbs-container">
        <FaThumbsUp
          className={`icon thumb-icon ${clickedIcons.thumbUp ? 'clicked' : ''}`}
          onClick={() => handleIconClick('thumbUp')}
        />
        <FaThumbsDown
          className={`icon thumb-icon ${clickedIcons.thumbDown ? 'clicked' : ''}`}
          onClick={() => handleIconClick('thumbDown')}
        />
      </div>
    </div>
  );
}
