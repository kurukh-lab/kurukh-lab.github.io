import React from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/wordUtils';
import PronunciationButton from './PronunciationButton';

/**
 * Component for displaying a dictionary word entry
 * @param {object} props Component props
 * @param {object} props.word Word object with word data
 * @param {boolean} [props.compact=false] Whether to show the word in compact format
 */
const WordCard = ({ word, compact = false }) => {
  if (!word) return null;

  if (compact) {
    return (
      <Link 
        to={`/word/${word.id}`} 
        className="block bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all"
      >
        <h3 className="text-lg font-semibold text-amber-800">{word.kurukh_word}</h3>
        {word.meanings && word.meanings.length > 0 && (
          <p className="text-gray-600 text-sm mt-1">
            {word.meanings[0].definition}
          </p>
        )}
      </Link>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-amber-800 mb-2">{word.kurukh_word}</h2>
            <PronunciationButton text={word.kurukh_word} />
          </div>
          
          {word.part_of_speech && (
            <p className="text-gray-500 italic mb-4">
              {word.part_of_speech.charAt(0).toUpperCase() + word.part_of_speech.slice(1)}
            </p>
          )}
        </div>
        
        <Link 
          to={`/word/${word.id}`} 
          className="btn btn-sm btn-outline btn-primary"
        >
          View Details
        </Link>
      </div>
      
      {word.meanings && word.meanings.length > 0 && (
        <div className="space-y-4">
          {word.meanings.map((meaning, index) => (
            <div key={index} className="border-l-4 border-amber-200 pl-4">
              <h3 className="font-medium">
                {meaning.language === 'en' ? 'English' : 'Hindi'}
              </h3>
              <p className="text-gray-800">{meaning.definition}</p>
              
              {meaning.example_sentence_kurukh && (
                <div className="mt-2 text-gray-600">
                  <p className="italic">{meaning.example_sentence_kurukh}</p>
                  <p className="text-sm">{meaning.example_sentence_translation}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {word.createdAt && (
        <div className="mt-4 text-xs text-gray-400">
          Added: {formatDate(word.createdAt)}
        </div>
      )}
    </div>
  );
};

export default WordCard;
