import React, { useState, useEffect } from 'react';
import SearchBar from '../components/common/SearchBar';
import WordList from '../components/dictionary/WordList';
import WordCard from '../components/dictionary/WordCard';
import DictionaryStats from '../components/dictionary/DictionaryStats';
import SearchShortcutHint from '../components/common/SearchShortcutHint';
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
    <div className="flex flex-col min-h-screen bg-base-100">
      {/* Header is handled by Layout.jsx */}
      
      <main className="flex-grow">
        {/* Hero Section with Search */}
        <div className={`py-16 bg-base-200 transition-all duration-300 ${searchResults.length > 0 ? 'py-8' : 'py-32'}`}>
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold mb-8">Kurukh Dictionary</h1>
              <div className="w-full max-w-xl mx-auto">
                <SearchBar onSearchComplete={handleSearch} />
                {searchResults.length === 0 && !loading && <SearchShortcutHint />}
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
                />
              </div>
            </div>
          </div>
        )}

        {/* Word of the Day Section - Shown when no search results and not loading/error */}
        {!loading && !error && searchResults.length === 0 && wordOfTheDay && (
          <section className="py-12 bg-base-100">
            <div className="container mx-auto px-4 max-w-2xl">
              <div className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="card-title">
                    <hr className="my-2 border-base-300" /> {/* Replaced Divider */}
                    Word of the Day
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
      <div>
      <div className="card bg-base-100 w-96 shadow-sm">
  <figure>
    <img
      src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
      alt="Shoes" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">Card Title</h2>
    <p>A card component has a figure, a body part, and inside body there are title and actions parts</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">Buy Now</button>
    </div>
  </div>
</div>  <div className="card lg:card-side bg-base-100 shadow-xl"> {/* Replaced Card */}
        <figure><img src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp" alt="Shoes" /></figure>
        <div className="card-body">
          <h2 className="card-title">Shoes!</h2>
          <p>If a dog chews shoes whose shoes does he choose?</p>
          <div className="card-actions justify-end">
            <button className="btn btn-primary">Buy Now</button> {/* Replaced Button */}
          </div>
        </div>
      </div>
      </div>

    </div>
  );
};

export default Home;
