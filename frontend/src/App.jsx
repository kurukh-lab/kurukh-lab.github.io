import React, { useState, useEffect } from 'react';
import './App.css';
import { KurukhDictionaryLogo } from './components/logo/KurukhDictionaryLogo';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalWords, setTotalWords] = useState(0);

  // Fetch total words count on component mount
  useEffect(() => {
    const fetchTotalWords = async () => {
      try {
        // Assuming your backend is running on port 5000
        // and you have a proxy set up in package.json (e.g., "proxy": "http://localhost:5000")
        // or you use the full URL.
        const response = await fetch('/api/words');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setTotalWords(data.length); // Assuming the API returns an array of all words
      } catch (error) {
        console.error('Failed to fetch total words:', error);
        // Set a default or handle error appropriately
        setTotalWords(0); 
      }
    };
    fetchTotalWords();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(`/api/words?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Search request failed');
      }
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Failed to search words:', error);
      setSearchResults([]);
    }
  };

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md w-full"> {/* Ensure content doesn't get too wide */}
          <div className="w-full flex justify-center">
            <KurukhDictionaryLogo />
          </div>
          <h1 className="averia-serif-libre-regular text-2xl">a crowd source</h1>
          <h1 className="averia-serif-libre-regular text-6xl">Kurukh Dictionary</h1>
          <p className="py-6 averia-serif-libre-regular">
            Total {totalWords} words contributed currently. <a href="/contribute" className="link link-primary">Contribute</a>
          </p>

          <form onSubmit={handleSearch} className="input input-bordered flex items-center gap-2 mb-4">
            <input
              type="text"
              className="grow"
              placeholder="Search Kurukh or English words"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {/* Display Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6 text-left">
              <h2 className="text-xl averia-serif-libre-regular mb-2">Results:</h2>
              <ul className="list-disc pl-5 space-y-2">
                {searchResults.map((word) => (
                  <li key={word._id} className="p-2 bg-base-100 rounded-md shadow">
                    <strong className="text-lg">{word.kurukh_word}</strong>
                    {word.meanings.map((meaning, index) => (
                      <div key={index} className="ml-2">
                        <span className="text-sm text-gray-500">({meaning.language}):</span> {meaning.definition}
                      </div>
                    ))}
                    {word.part_of_speech && <p className="text-xs text-gray-400">Part of Speech: {word.part_of_speech}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
           {searchTerm && searchResults.length === 0 && (
            <p className="mt-4">No results found for "{searchTerm}".</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
