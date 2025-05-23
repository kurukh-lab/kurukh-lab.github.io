import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

export const WordDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedWords, setRelatedWords] = useState([]);

  useEffect(() => {
    const fetchWordDetails = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/words/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch word details');
        }
        const data = await response.json();
        setWord(data);
        
        // Fetch related words based on tags (if any)
        if (data.tags && data.tags.length > 0) {
          const tag = encodeURIComponent(data.tags[0]); // Use the first tag for related words
          const relatedResponse = await fetch(`/api/words?search=${tag}`);
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json();
            // Filter out the current word and limit to 3 related words
            setRelatedWords(
              relatedData
                .filter(relatedWord => relatedWord._id !== id)
                .slice(0, 3)
            );
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching word details:', err);
        setError('Failed to load word details. This word may not exist or is not approved yet.');
      } finally {
        setLoading(false);
      }
    };

    fetchWordDetails();
  }, [id]);

  const canEdit = isAuthenticated && word && user && word.contributor_id && 
                word.contributor_id._id === user.id;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
        <Navbar />
        <main className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="alert alert-error">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
            <div className="mt-4 text-center">
              <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!word) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Word Not Found</h2>
            <p className="mb-4">The word you're looking for could not be found or is not approved yet.</p>
            <Link to="/" className="btn btn-primary">Back to Home</Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-base-200 to-base-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
          {/* Back button */}
          <button 
            onClick={() => navigate(-1)} 
            className="mb-6 flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          {/* Word header */}
          <div className="flex flex-wrap justify-between items-start mb-4">
            <h1 className="text-4xl font-bold averia-serif-libre-bold mb-2">{word.kurukh_word}</h1>
            <div className="flex flex-wrap gap-2">
              {word.part_of_speech && (
                <span className="badge badge-lg badge-ghost">{word.part_of_speech}</span>
              )}
              {canEdit && (
                <Link to={`/edit-word/${word._id}`} className="btn btn-sm btn-outline btn-primary">
                  Edit Word
                </Link>
              )}
            </div>
          </div>
          
          {/* Pronunciation */}
          {word.pronunciation_guide && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700">Pronunciation</h3>
              <p className="text-lg italic">{word.pronunciation_guide}</p>
            </div>
          )}
          
          {/* Meanings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-3 averia-serif-libre-bold">Meanings</h3>
            <div className="space-y-5">
              {word.meanings.map((meaning, index) => (
                <div key={index} className="bg-base-100 p-4 rounded-lg border-l-4 border-primary">
                  <div className="flex items-center mb-2">
                    <span className="text-sm font-medium bg-primary text-primary-content px-2 py-0.5 rounded">
                      {meaning.language === 'en' ? 'English' : 
                       meaning.language === 'hi' ? 'Hindi' : 
                       meaning.language === 'bn' ? 'Bengali' : 
                       meaning.language === 'or' ? 'Odia' : meaning.language}
                    </span>
                  </div>
                  <p className="text-xl mb-3">{meaning.definition}</p>
                  
                  {meaning.example_sentence_kurukh && (
                    <div className="mt-2 border-t border-gray-100 pt-2">
                      <p className="italic text-primary">"{meaning.example_sentence_kurukh}"</p>
                      {meaning.example_sentence_translation && (
                        <p className="text-gray-600">"{meaning.example_sentence_translation}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Tags */}
          {word.tags && word.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {word.tags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">{tag}</span>
                ))}
              </div>
            </div>
          )}
          
          {/* Contributor info */}
          <div className="mt-8 text-right text-sm text-gray-500">
            <p>Contributed by: {word.contributor_id?.username || 'Anonymous'}</p>
            <p>Added on: {new Date(word.createdAt).toLocaleDateString()}</p>
            {word.updatedAt !== word.createdAt && (
              <p>Last updated: {new Date(word.updatedAt).toLocaleDateString()}</p>
            )}
          </div>
        </div>
        
        {/* Related Words */}
        {relatedWords.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 averia-serif-libre-bold">Related Words</h3>
            <div className="grid gap-4 md:grid-cols-3">
              {relatedWords.map(relatedWord => (
                <Link 
                  key={relatedWord._id} 
                  to={`/word/${relatedWord._id}`}
                  className="card bg-base-200 hover:shadow-lg transition-shadow"
                >
                  <div className="card-body p-4">
                    <h4 className="card-title text-lg">{relatedWord.kurukh_word}</h4>
                    {relatedWord.meanings && relatedWord.meanings.length > 0 && (
                      <p className="text-sm truncate">{relatedWord.meanings[0].definition}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        
        {/* Call to action */}
        <div className="mt-8 text-center">
          <p className="mb-3">Know more words like this? Help grow our dictionary!</p>
          <Link to="/contribute" className="btn btn-primary">Contribute Words</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};
