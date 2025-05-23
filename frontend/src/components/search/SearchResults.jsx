import React from 'react';
import { Link } from 'react-router-dom';

export const SearchResults = ({ results, searchTerm }) => {
  if (!searchTerm) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="mt-8 text-center bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-2">No results found</h2>
        <p className="text-gray-600">
          No results found for "<span className="font-medium">{searchTerm}</span>".
        </p>
        <p className="mt-3 text-sm text-gray-500">
          Try using a different spelling or keyword. If you're a registered user, you can <a href="/contribute" className="text-primary hover:underline">contribute</a> this word to our dictionary!
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 averia-serif-libre-bold">Search Results</h2>
      <p className="text-gray-600 mb-4">
        Found {results.length} result{results.length !== 1 ? 's' : ''} for "<span className="font-medium">{searchTerm}</span>"
      </p>
      
      <div className="space-y-6">
        {results.map((word) => (
          <div key={word._id} className="bg-base-100 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-wrap justify-between items-start mb-2">
              <Link to={`/word/${word._id}`} className="text-2xl font-bold averia-serif-libre-bold hover:text-primary transition-colors">
                {word.kurukh_word}
              </Link>
              {word.part_of_speech && (
                <span className="badge badge-ghost">{word.part_of_speech}</span>
              )}
            </div>
            
            {word.pronunciation_guide && (
              <p className="text-gray-500 italic mb-3">Pronunciation: {word.pronunciation_guide}</p>
            )}
            
            <div className="space-y-3">
              {word.meanings.map((meaning, index) => (
                <div key={index} className="ml-2 border-l-2 border-primary pl-3">
                  <div className="flex items-center">
                    <span className="text-sm bg-primary text-primary-content px-2 py-0.5 rounded">
                      {meaning.language === 'en' ? 'English' : 
                       meaning.language === 'hi' ? 'Hindi' : 
                       meaning.language === 'bn' ? 'Bengali' : 
                       meaning.language === 'or' ? 'Odia' : meaning.language}
                    </span>
                  </div>
                  <p className="mt-1 text-lg">{meaning.definition}</p>
                  
                  {meaning.example_sentence_kurukh && (
                    <div className="mt-2 text-sm">
                      <p className="italic text-primary">"{meaning.example_sentence_kurukh}"</p>
                      {meaning.example_sentence_translation && (
                        <p className="text-gray-600">"{meaning.example_sentence_translation}"</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {word.tags && word.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {word.tags.map((tag, index) => (
                  <span key={index} className="badge badge-outline">{tag}</span>
                ))}
              </div>
            )}
            
            <div className="mt-3 flex justify-between items-center">
              {word.contributor_id && (
                <p className="text-xs text-gray-500">
                  Contributed by: {word.contributor_id.username || 'Anonymous'}
                </p>
              )}
              <Link to={`/word/${word._id}`} className="btn btn-sm btn-ghost text-primary">
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
