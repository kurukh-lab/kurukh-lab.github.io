import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export const WordOfTheDay = () => {
  const [word, setWord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWordOfTheDay = async () => {
      setLoading(true);
      try {
        // In a real implementation, there would be a specific API endpoint
        // for word of the day. For now, we'll just fetch a random approved word
        const response = await fetch('/api/words?status=approved');
        if (!response.ok) {
          throw new Error('Failed to fetch words');
        }
        
        const approvedWords = await response.json();
        
        if (approvedWords.length === 0) {
          setError('No approved words found');
          setLoading(false);
          return;
        }
        
        // Get a random word using the current date as a seed
        // This ensures the same word shows up all day
        const today = new Date();
        const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
        const randomIndex = seed % approvedWords.length;
        
        setWord(approvedWords[randomIndex]);
        setError(null);
      } catch (err) {
        console.error('Error fetching word of the day:', err);
        setError('Failed to load word of the day');
      } finally {
        setLoading(false);
      }
    };

    fetchWordOfTheDay();
  }, []);

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-md animate-pulse">
        <div className="card-body">
          <h3 className="text-2xl font-bold mb-4 averia-serif-libre-bold">Word of the Day</h3>
          <div className="h-6 bg-base-300 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-base-300 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-base-300 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error || !word) {
    return null; // Don't show anything if there's an error
  }

  return (
    <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body">
        <div className="flex justify-between items-start">
          <h3 className="text-2xl font-bold mb-4 averia-serif-libre-bold">Word of the Day</h3>
          <div className="badge badge-secondary">Daily</div>
        </div>
        
        <Link to={`/word/${word._id}`} className="text-2xl font-bold hover:text-primary transition-colors">
          {word.kurukh_word}
        </Link>
        
        {word.part_of_speech && (
          <div className="badge badge-ghost mb-2">{word.part_of_speech}</div>
        )}
        
        {word.meanings && word.meanings.length > 0 && (
          <p className="text-base">{word.meanings[0].definition}</p>
        )}
        
        <div className="card-actions justify-end mt-4">
          <Link to={`/word/${word._id}`} className="btn btn-sm btn-primary">
            Learn More
          </Link>
        </div>
      </div>
    </div>
  );
};
