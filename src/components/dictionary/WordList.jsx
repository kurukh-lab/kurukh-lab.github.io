import React from 'react';
import WordCard from './WordCard';

/**
 * Component to display a list of dictionary words
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
      <div className="text-center text-gray-500 py-8">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && <h2 className="text-xl font-bold mb-4">{title}</h2>}
      
      <div className={compact 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        : "space-y-6"
      }>
        {words.map((word) => (
          <WordCard 
            key={word.id} 
            word={word} 
            compact={compact} 
          />
        ))}
      </div>
    </div>
  );
};

export default WordList;
