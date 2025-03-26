import React, { useState, useEffect } from 'react';
import { FaAngleLeft, FaAngleRight, FaRegThumbsUp, FaRegThumbsDown } from 'react-icons/fa6';
import axios from 'axios';
import SearchBar from '../components/SearchBar';

export default function Recomendations() {
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

  async function getRandomGame() {
    try {
      const response = await axios.get('http://127.0.0.1:5000/games/random_game', { timeout: 5000 });
      return response.data;
    } catch (err) {
      console.log("Unhandled error: " + err);
      return null;
    }
  }

  const [gameList, setGameList] = useState([null]); // the list of items
  const [currentIndex, setCurrentIndex] = useState(0); // current index in the list

  async function handleArrowClick(direction)  {
    if (direction === "right") {
      const nextIndex = currentIndex + 1;
      if (nextIndex >= gameList.length) {
        const additionalItems = [await getRandomGame()];
        setGameList(prevItems => [...prevItems, ...additionalItems]);
      }
      setCurrentIndex(nextIndex);
      
    } else if (direction === "left") {
      const prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        const additionalItems = [await getRandomGame()];
        setGameList(prevItems => [...additionalItems, ...prevItems]);
        setCurrentIndex(additionalItems.length - 1);
      } else {
        setCurrentIndex(prevIndex);
      }
    }
  };

  useEffect(() => {
    async function getFirstGame(numTries) {
      const MAX_TRIES = 120;
      const firstGame = await getRandomGame();
      if (!firstGame) {
        if (numTries > MAX_TRIES) {
          console.log("failed to load too many times");
          return;
        } else {
          await new Promise(r => setTimeout(r, 500));
          getFirstGame(numTries + 1);
        }
      } else {
        setGameList([firstGame]);
        setCurrentIndex(0);
      }
    }
    getFirstGame(0);
  }, []);

  const handleSearchSelection = (item) => {
    console.log("item: ", item)

    const index = gameList.findIndex(game => game.igdb_id === item.igdb_id) 

    if (index > -1) {
      setCurrentIndex(index)
    } else {
      const left = gameList.slice(0, currentIndex + 1)
      const right = gameList.slice(currentIndex + 1)
      setGameList(left.concat(item, right))
      setCurrentIndex(currentIndex + 1)
    }
    
  }

  return (
    <div className="grid grid-rows-[1fr,auto] min-h-screen w-screen">
      <main className="flex flex-col items-center justify-start text-center mr-auto w-screen">
        <SearchBar onSelect={handleSearchSelection}/>
        <h1 className="text-6xl mb-10 mt-5 font-mono text-[#DD0000]">
          <a href={gameList[currentIndex] ? gameList[currentIndex].url : ''}>
            {gameList[currentIndex] ? gameList[currentIndex].name : 'Loading...'}
          </a>
        </h1>
        <div className="flex flex-row items-start justify-center gap-2.5">
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center justify-center mb-6">
              <FaAngleLeft
                className={`text-[1rem] cursor-pointer border-[3px] border-transparent rounded-full p-4 transition-colors duration-75 mx-5 w-16 h-16 ${clickedIcons.leftArrow ? 'border-[#00f7ff] bg-[#ccffff]' : 'hover:border-gray-500 hover:bg-gray-100'}`}
                onClick={() => { handleIconClick('leftArrow'); handleArrowClick('left'); }}
              />
              <div className="flex justify-center items-center w-72">
                <img
                  src={gameList[currentIndex] ? gameList[currentIndex].cover_url : null}
                  alt={gameList[currentIndex] ? gameList[currentIndex].cover : null}
                  className="w-full h-full object-contain"
                />
              </div>
              <FaAngleRight
                className={`text-[1rem] cursor-pointer border-[3px] border-transparent rounded-full p-4 transition-colors duration-75 mx-5 w-16 h-16 ${clickedIcons.rightArrow ? 'border-[#00f7ff] bg-[#ccffff]' : 'hover:border-gray-500 hover:bg-gray-100'}`}
                onClick={() => { handleIconClick('rightArrow'); handleArrowClick('right'); }}
              />
            </div>
            <div className="flex justify-center gap-14">
              <FaRegThumbsUp
                className={`text-[3rem] cursor-pointer border-[3px] border-transparent rounded-full p-4 transition-colors duration-75 h-16 w-16 ${clickedIcons.thumbUp ? 'border-[#28a745] bg-[#c3e6cb]' : 'hover:border-gray-500 hover:bg-gray-100'}`}
                onClick={() => handleIconClick('thumbUp')}
              />
              <FaRegThumbsDown
                className={`text-[3rem] cursor-pointer border-[3px] border-transparent rounded-full p-4 transition-colors duration-75 h-16 w-16 ${clickedIcons.thumbDown ? 'border-[#a72828] bg-[#e6c3c3]' : 'hover:border-gray-500 hover:bg-gray-100'}`}
                onClick={() => handleIconClick('thumbDown')}
              />
            </div>
          </div>
          <div className="max-w-[400px] flex flex-col items-center justify-center">
            <span className="rating-container">
              <h3>Rating: {gameList[currentIndex] ? (gameList[currentIndex].rating / 10).toFixed(2) : 'Loading...'}/10</h3>
            </span>
            <div className="whitespace-normal break-words text-base">
              <p>{gameList[currentIndex] ? gameList[currentIndex].summary : ''}</p>
            </div>
          </div>
        </div>
      </main>
      <footer className="text-center p-2">
        <div>Copyright &copy; 2025 Sandboxers</div>
      </footer>
    </div>
  );
}
