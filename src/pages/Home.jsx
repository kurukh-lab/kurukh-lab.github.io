import React, { useState, useEffect } from 'react';
import KurukhDictionaryLogo from '../components/logo/KurukhDictionaryLogo';
import SearchBar from '../components/common/SearchBar';
import WordList from '../components/dictionary/WordList';
import WordCard from '../components/dictionary/WordCard';
import DictionaryStats from '../components/dictionary/DictionaryStats';
import SearchShortcutHint from '../components/common/SearchShortcutHint';
import { getRecentWords } from '../services/dictionaryService';
import { getWordOfTheDay } from '../utils/wordUtils';
import useSearch from '../hooks/useSearch';
// Import required components from react-daisyui
import { Hero, Card, Divider, Alert, Loading } from 'react-daisyui';

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
    <Hero className="min-h-screen bg-base-100">
      <div className="flex flex-col items-center w-full max-w-5xl px-4">
        {/* Search engine style center-aligned content for initial view */}
        <div className={`flex flex-col items-center justify-center transition-all duration-300 ${searchResults.length > 0 ? 'pt-8' : 'pt-32'}`}>
          {/* Logo Section - Larger when no search results */}
          <div className={`mb-8 transition-all ${searchResults.length > 0 ? 'scale-75' : 'scale-100'}`}>
            <KurukhDictionaryLogo size={searchResults.length > 0 ? "md" : "xl"} />
          </div>
          
          {/* Search Section */}
          <div className={`w-full max-w-2xl transition-all ${searchResults.length > 0 ? 'max-w-xl' : 'max-w-2xl'}`}>
            <SearchBar onSearchComplete={handleSearch} />
            {/* Add keyboard shortcut hint when no search results */}
            {searchResults.length === 0 && !loading && <SearchShortcutHint />}
          </div>
        </div>
        
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loading variant="spinner" size="lg" />
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <Alert status="error" className="w-full max-w-3xl mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </Alert>
        )}

        {/* Results Section - Full width and scrollable like search engines */}
        {searchResults.length > 0 && (
          <div className="w-full mt-8">
            <Divider className="mb-4">Results</Divider>
            <Card className="bg-base-100 shadow-md">
              <Card.Body className="p-4">
                <WordList 
                  words={searchResults} 
                  title={`Search Results (${searchResults.length})`} 
                />
              </Card.Body>
            </Card>
          </div>
        )}

        {/* Content when no search is performed - More visually appealing layout */}
        {!loading && !error && searchResults.length === 0 && (
          <div className="mt-12 w-full grid gap-8 grid-cols-1 md:grid-cols-2">
            {/* Left side: Word of the Day */}
            <Card className="bg-base-100 shadow-lg">
              <Card.Body>
                <Card.Title>
                  <Divider className="mb-2">Word of the Day</Divider>
                </Card.Title>
                {wordOfTheDay && <WordCard word={wordOfTheDay} />}
              </Card.Body>
            </Card>
            
            {/* Right side: Dictionary Stats and Recent Words */}
            <div className="flex flex-col gap-8">
              {/* Dictionary Stats */}
              <Card className="bg-base-100 shadow-lg">
                <Card.Body>
                  <Card.Title>
                    <Divider className="mb-2">Dictionary Statistics</Divider>
                  </Card.Title>
                  <DictionaryStats />
                </Card.Body>
              </Card>

              {/* Recent Words */}
              {recentWords.length > 0 && (
                <Card className="bg-base-100 shadow-lg">
                  <Card.Body>
                    <Card.Title>
                      <Divider className="mb-2">Recently Added Words</Divider>
                    </Card.Title>
                    <WordList 
                      words={recentWords} 
                      title="" 
                      compact={true} 
                    />
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Hero>
  );
};

export default Home;
