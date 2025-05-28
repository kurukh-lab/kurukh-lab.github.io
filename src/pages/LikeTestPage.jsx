import React, { useState, useEffect } from 'react';
import LikeButton from '../components/dictionary/LikeButton';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';

const LikeTestPage = () => {
  const [testWords, setTestWords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestWords = async () => {
      try {
        const wordsQuery = query(
          collection(db, 'words'),
          where('status', '==', 'approved')
        );
        const snapshot = await getDocs(wordsQuery);
        
        const words = [];
        snapshot.forEach((doc) => {
          words.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setTestWords(words.slice(0, 3)); // Show first 3 words for testing
      } catch (error) {
        console.error('Error fetching test words:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestWords();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Like Button Test Page</h1>
        <p className="text-lg text-gray-600">
          Test the like functionality with real words from the database.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Instructions:</h3>
          <ul className="list-disc list-inside text-blue-700 mt-2">
            <li>Click the heart buttons to like/unlike words</li>
            <li>Like counts should update immediately</li>
            <li>Your likes are stored anonymously in localStorage</li>
            <li>Refresh the page - your likes should persist</li>
          </ul>
        </div>
      </div>

      <div className="space-y-6">
        {testWords.map((word) => (
          <div key={word.id} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="card-title text-primary">{word.kurukh_word}</h2>
                  {word.meanings && word.meanings[0] && (
                    <p className="text-gray-600">{word.meanings[0].definition}</p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Word ID: {word.id}
                  </p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <LikeButton word={word} size="sm" />
                  <LikeButton word={word} size="md" />
                  <LikeButton word={word} size="lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <p className="text-sm text-gray-600">
          Anonymous User ID: {localStorage.getItem('kurukh_anonymous_id') || 'Not set'}
        </p>
        <button 
          className="btn btn-sm btn-outline mt-2"
          onClick={() => {
            localStorage.removeItem('kurukh_anonymous_id');
            window.location.reload();
          }}
        >
          Clear Anonymous ID & Reload
        </button>
      </div>
    </div>
  );
};

export default LikeTestPage;
