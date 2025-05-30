import React from 'react';
import WordCard from './WordCard';

/**
 * Component to display a list of dictionary words styled like search engine results
 * @param {object} props Component props
 * @param {array} props.words Array of word objects
 * @param {string} [props.title] Optional title for the list
 * @param {boolean} [props.compact=false] Whether to show the words in compact format
 * @param {string} [props.emptyMessage] Message to show when there are no words
 * @param {string} [props.searchTerm] Search term to highlight in results
 */
const WordList = ({
  words = [],
  title,
  compact = false,
  emptyMessage = "No words found.",
  searchTerm = ""
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
    <div className={`word-list-container ${compact ? 'compact' : ''}`}>
      {title && <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>}
      {title && <hr className="my-4 border-base-300" />} {/* Replaced Divider */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {words.map((word, index) => (
          <WordCard key={word.id || index} word={word} compact={compact} searchTerm={searchTerm} />
        ))}
      </div>
    </div>
  );
};

export default WordList;
