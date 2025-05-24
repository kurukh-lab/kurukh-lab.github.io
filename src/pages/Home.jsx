import React, { useState, useEffect } from 'react';
import KurukhDictionaryLogo from '../components/logo/KurukhDictionaryLogo';
import SearchBar from '../components/common/SearchBar';
import WordList from '../components/dictionary/WordList';
import WordCard from '../components/dictionary/WordCard';
import DictionaryStats from '../components/dictionary/DictionaryStats';
import { getRecentWords } from '../services/dictionaryService';
import { getWordOfTheDay } from '../utils/wordUtils';
import useSearch from '../hooks/useSearch';

const Home = () => {
  const [recentWords, setRecentWords] = useState([]);
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchResults, handleSearch } = useSearch();

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch recent words and word of the day in parallel
        const [recentWordsData, wordOfTheDayData] = await Promise.all([
          getRecentWords(6),
          getWordOfTheDay()
        ]);
        
        setRecentWords(recentWordsData);
        setWordOfTheDay(wordOfTheDayData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dictionary data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center min-h-[80vh] gap-8 pt-6 pb-12">
      {/* Logo Section */}
      <div className="mb-4">
        <KurukhDictionaryLogo size="lg" />
      </div>
      
      {/* Search Section */}
      <div className="w-full max-w-2xl">
        <SearchBar onSearchComplete={handleSearch} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="alert alert-error w-full max-w-2xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Results Section */}
      {searchResults.length > 0 && (
        <div className="w-full max-w-2xl">
          <WordList 
            words={searchResults} 
            title="Search Results" 
          />
        </div>
      )}

      {/* Word of the Day Section */}
      {!loading && !error && searchResults.length === 0 && wordOfTheDay && (
        <div className="w-full max-w-2xl mb-8">
          <h2 className="text-xl font-bold mb-4">Word of the Day</h2>
          <WordCard word={wordOfTheDay} />
        </div>
      )}
      
      {/* Dictionary Stats Section */}
      {!loading && !error && searchResults.length === 0 && (
        <div className="w-full max-w-2xl mt-6">
          <DictionaryStats />
        </div>
      )}

      {/* Recent Words Section */}
      {!loading && !error && searchResults.length === 0 && recentWords.length > 0 && (
        <div className="w-full max-w-2xl mt-8">
          <WordList 
            words={recentWords} 
            title="Recently Added Words" 
            compact={true} 
          />
        </div>
      )}
    </div>
  );
};

export default Home;
