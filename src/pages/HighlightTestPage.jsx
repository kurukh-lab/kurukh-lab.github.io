import React, { useState } from 'react';
import { highlightText } from '../utils/highlightUtils.jsx';

/**
 * Demo page for testing search highlighting functionality
 */
const HighlightTestPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sample words for testing
  const sampleWords = [
    {
      id: 1,
      kurukh_word: 'mankhaa',
      meanings: [
        { language: 'en', definition: 'man, person, human being' }
      ]
    },
    {
      id: 2,
      kurukh_word: 'pani',
      meanings: [
        { language: 'en', definition: 'water' }
      ]
    },
    {
      id: 3,
      kurukh_word: 'khana',
      meanings: [
        { language: 'en', definition: 'food, meal' }
      ]
    },
    {
      id: 4,
      kurukh_word: 'dokon',
      meanings: [
        { language: 'en', definition: 'tree, wood' }
      ]
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Search Highlighting Test</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Test Search Term:</label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter a search term (e.g., 'man', 'pan', 'kha')"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sample Words with Highlighting:</h2>

        {sampleWords.map(word => (
          <div key={word.id} className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="text-lg font-bold text-primary">
                {searchTerm ? highlightText(word.kurukh_word, searchTerm) : word.kurukh_word}
              </h3>
              <p className="text-neutral-content">
                {searchTerm ? highlightText(word.meanings[0].definition, searchTerm) : word.meanings[0].definition}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-base-200 rounded-lg">
        <h3 className="font-semibold mb-2">Test Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Try searching for "man" - should highlight in "mankhaa"</li>
          <li>Try searching for "pan" - should highlight in "pani"</li>
          <li>Try searching for "kha" - should highlight in "mankhaa" and "khana"</li>
          <li>Try searching for "water" - should highlight in the definition</li>
        </ul>
      </div>
    </div>
  );
};

export default HighlightTestPage;
