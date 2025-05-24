import React from 'react';
import WordCard from './WordCard';
import { Divider } from 'react-daisyui';

/**
 * Component to display a list of dictionary words styled like search engine results
 * @param {object} props Component props
 * @param {array} props.words Array of word objects
 * @param {string} [props.title] Optional title for the list
 * @param {boolean} [props.compact=false] Whether to show the words in compact format
 * @param {string} [props.emptyMessage] Message to show when there are no words
 */
const WordList = ({ 
  words = [], 
  title, 
  compact = false,
  emptyMessage = "No words found."
}) => {
  if (!words || words.length === 0) {
    return (
      <div className="text-center text-neutral-content py-8 flex flex-col items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        <p className="font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-semibold">{title}</span>
          {words.length > 0 && (
            <span className="text-sm text-neutral-content">
              {words.length === 1 ? '1 result' : `${words.length} results`}
            </span>
          )}
        </div>
      )}
      
      {compact ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {words.map((word) => (
            <WordCard 
              key={word.id} 
              word={word} 
              compact={true} 
            />
          ))}
        </div>
      ) : (
        // Search results style - stacked vertically
        <div>
          {words.map((word, index) => (
            <React.Fragment key={word.id}>
              <WordCard word={word} compact={false} />
              {index < words.length - 1 && <div className="my-1" />}
            </React.Fragment>
          ))}
          
          {/* Pagination-like element at bottom similar to search engines */}
          {words.length > 8 && (
            <div className="flex justify-center mt-8">
              <div className="join">
                <button className="join-item btn btn-sm btn-active">1</button>
                <button className="join-item btn btn-sm btn-ghost">2</button>
                <button className="join-item btn btn-sm btn-ghost">3</button>
                <button className="join-item btn btn-sm btn-ghost">...</button>
                <button className="join-item btn btn-sm btn-ghost">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WordList;
