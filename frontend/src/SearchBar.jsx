import React, { useState, useEffect } from 'react';
import axios from 'axios'

function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  // Debounced API call effect
  useEffect(() => {

    const timer = setTimeout(() => {
      if (query) {
        axios.get('http://127.0.0.1:5000/games/search',
          { params: { search_term: query } }
        )
        .then((response) => {
          console.log(response.data.result);
          setResults(response.data.result);
        })
          .catch((error) => console.log('Error fetching data:', error));
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="search-container">
      <input
        type="search"
        id="search-bar"
        maxLength="255"
        placeholder="The next game you'll love is..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {results.length > 0 && (
        <div className="search-results">
          {results.map((item, index) => (
            <div key={index} className="search-result-item">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBar;