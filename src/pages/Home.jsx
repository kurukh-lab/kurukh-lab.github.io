import React, { useState, useEffect } from 'react';
import SearchBar from '../components/common/SearchBar';
import WordList from '../components/dictionary/WordList';
import WordCard from '../components/dictionary/WordCard';
import DictionaryStats from '../components/dictionary/DictionaryStats';
import SearchShortcutHint from '../components/common/SearchShortcutHint';
import { getRecentWords, getWordOfTheDay } from '../services/dictionaryService';
import useSearch from '../hooks/useSearch';

const Home = () => {
  const [recentWords, setRecentWords] = useState([]);
  const [wordOfTheDay, setWordOfTheDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { searchResults, searchTerm, setSearchTerm, handleSearch, loading: searchLoading } = useSearch();

  // Handle search completion from SearchBar
  const handleSearchComplete = async (term) => {
    console.log('🔍 Home: Search completed for term:', term);
    // The search results will be available through the useSearch hook
    // No need to do anything else here since SearchBar already called handleSearch
  };

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
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Header is handled by Layout.jsx */}

      <main className="flex-grow">
        {/* Hero Section with Search */}
        <div className={`py-16 transition-all duration-300 ${searchResults.length > 0 ? 'py-8' : 'py-32'}`}>
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold mb-8 averia-serif-libre-bold">Kurukh Dictionary</h1>
              <div className="w-full max-w-xl mx-auto">
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchTermChange={setSearchTerm}
                  onSearch={handleSearch}
                  loading={searchLoading}
                  onSearchComplete={handleSearchComplete}
                />
                {searchResults.length === 0 && !loading && !searchLoading && <SearchShortcutHint />}
              </div>
            </div>
          </div>
        </div>



        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            {/* <Loading variant="spinner" size="lg" /> */}
            <div>Loading...</div>
          </div>
        )}

        {/* Error Message */}
        {error && !loading && (
          <div role="alert" className="alert alert-error w-full max-w-3xl mx-auto mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}



        {/* Results Section */}
        {searchResults.length > 0 && (
          <div className="w-full max-w-4xl mx-auto mt-8 p-4">
            <hr className="my-4 border-base-300" /> {/* Replaced Divider */}
            <div className="card bg-base-100 shadow-md">
              <div className="card-body p-4">
                <WordList
                  words={searchResults}
                  title={`Search Results (${searchResults.length})`}
                  searchTerm={searchTerm}
                />
              </div>
            </div>
          </div>
        )}

        {/* Word of the Day Section - Shown when no search results and not loading/error */}
        {!loading && !error && searchResults.length === 0 && wordOfTheDay && (
          <section className="py-12 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="card bg-base-100 shadow-xl border border-primary/10">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-primary">Word of the Day</h2>
                    <div className="badge badge-secondary badge-sm">
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                  <WordCard word={wordOfTheDay} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Placeholder for Recently Added Words or other content if needed */}
        {!loading && !error && searchResults.length === 0 && recentWords.length > 0 && (
          <section className="py-12 bg-base-200">
            <div className="container mx-auto px-4 max-w-4xl">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="card-title">
                    <hr className="my-2 border-base-300" /> {/* Replaced Divider */}
                    Recently Added Words
                  </div>
                  <WordList
                    words={recentWords}
                    title=""
                    compact={true}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      {/* Footer is handled by Layout.jsx */}
    </div>
  );
};

export default Home;
