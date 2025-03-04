import React, { useState } from 'react';

function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    //TODO: Implement this
  };

  return (
    <input
      id="search-bar"
      type="text"
      placeholder="Search a game!"
      value={searchTerm}
      onChange={handleInputChange}
    />
  );
}

export default SearchBar;