import React, { useState, useEffect, useRef } from 'react';

export const SearchBar = ({ onSearch, initialSearchTerm = '' }) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Focus effect animation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      await onSearch(searchTerm);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative w-full max-w-xl mx-auto fade-in"
    >
      <div className={`relative transition-all duration-300 ${isFocused ? 'transform scale-105' : ''}`}>
        <input
          ref={inputRef}
          type="text"
          className="input input-bordered w-full pl-4 pr-16 h-14 text-lg rounded-full bg-white shadow-md focus:shadow-xl transition-shadow focus:border-primary"
          placeholder="Search Kurukh or English words..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <button
          type="submit"
          className={`absolute right-0 top-0 rounded-r-full btn btn-primary h-full px-6 transition-all ${isSearching ? 'loading' : ''}`}
          disabled={isSearching}
        >
          {!isSearching && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>
      </div>
      
      <p className="text-xs text-center mt-2 text-gray-500">
        Try searching words like "water", "mother", or any Kurukh word
      </p>
    </form>
  );
};
