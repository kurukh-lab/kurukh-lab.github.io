import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { SearchBar } from '../components/search/SearchBar';
import { SearchResults } from '../components/search/SearchResults';
import { KurukhDictionaryLogo } from '../components/logo/KurukhDictionaryLogo';
import { WordOfTheDay } from '../components/word/WordOfTheDay';
import { Link } from 'react-router-dom';

export const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [totalWords, setTotalWords] = useState(0);
  const [recentWords, setRecentWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch total words count and recent words on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all words (which will give us the total count)
        const response = await fetch('/api/words');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        
        setTotalWords(data.length);
        
        // Get the 5 most recent words
        const sortedWords = [...data].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5);
        
        setRecentWords(sortedWords);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setError('Failed to load dictionary data. Please try again later.');
        setTotalWords(0);
        setRecentWords([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleSearch = async (term) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await fetch(`/api/words?search=${encodeURIComponent(term)}`);
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24">
                <KurukhDictionaryLogo />
              </div>
            </div>
            <h1 className="averia-serif-libre-regular text-2xl sm:text-3xl mb-2">a crowd sourced</h1>
            <h1 className="averia-serif-libre-bold text-4xl sm:text-6xl mb-4">Kurukh Dictionary</h1>
            <p className="averia-serif-libre-regular text-lg max-w-2xl mx-auto mb-8">
              Preserving and sharing the language and cultural heritage of the Kurukh community through collaborative contributions.
            </p>
            
            <div className="mb-8">
              <SearchBar onSearch={handleSearch} />
            </div>
            
            {loading ? (
              <div className="flex justify-center my-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="alert alert-error mt-8 max-w-md mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            ) : (
              <div className="averia-serif-libre-regular bg-white bg-opacity-70 py-3 px-6 rounded-full inline-block">
                <span className="font-bold">{totalWords}</span> words in our dictionary. Help us grow!{' '}
                <Link to="/contribute" className="text-primary hover:underline font-bold">
                  Contribute
                </Link>
              </div>
            )}
            
            <SearchResults results={searchResults} searchTerm={searchTerm} />
          </div>
        </section>
        
        {/* Recent Additions Section */}
        {!searchTerm && recentWords.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 bg-base-100">
            <div className="max-w-5xl mx-auto">
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="lg:col-span-1">
                  <WordOfTheDay />
                </div>
                <div className="lg:col-span-3">
                  <h2 className="averia-serif-libre-bold text-3xl mb-8 text-center">Recent Additions</h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {recentWords.map((word) => (
                      <div key={word._id} className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
                        <div className="card-body">
                          <Link to={`/word/${word._id}`} className="card-title averia-serif-libre-bold text-xl hover:text-primary transition-colors">
                            {word.kurukh_word}
                          </Link>
                          {word.meanings && word.meanings.length > 0 && (
                            <p className="text-sm">{word.meanings[0].definition}</p>
                          )}
                          <div className="flex justify-between items-center mt-2">
                            {word.part_of_speech && (
                              <span className="badge badge-ghost">{word.part_of_speech}</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {new Date(word.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="card-actions justify-end mt-2">
                            <Link to={`/word/${word._id}`} className="btn btn-xs btn-ghost text-primary">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {/* Call to Action */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary to-primary-focus text-primary-content text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="averia-serif-libre-bold text-3xl mb-4">Help Preserve the Kurukh Language</h2>
            <p className="averia-serif-libre-regular text-lg mb-8 max-w-2xl mx-auto">
              Join our community of contributors and help preserve the rich cultural heritage of the Kurukh language for future generations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contribute" className="btn btn-secondary">
                Contribute Words
              </Link>
              <Link to="/about" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary">
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};
