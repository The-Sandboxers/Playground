import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounced API call effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) {
        axios.get('http://127.0.0.1:5000/games/search', { params: { search_term: query } })
          .then(response => {
            console.log(response.data.result);
            setResults(response.data.result);
          })
          .catch(error => console.log('Error fetching data:', error));
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <input
        type="search"
        id="search-bar"
        maxLength="255"
        placeholder="The next game you'll love is..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-72 h-8 border border-red-500 bg-gray-200 text-black font-sans"
      />
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 z-10">
          {results.map((item, index) => (
            <div key={index} className="p-0.5 cursor-pointer text-black opacity-80 hover:bg-gray-100">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;
