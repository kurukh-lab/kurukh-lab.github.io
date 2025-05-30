import React from 'react';
import PronunciationButton from './PronunciationButton';
import ShareWordButtons from './ShareWordButtons';
import LikeButton from './LikeButton';
import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/wordUtils';
import { highlightText } from '../../utils/highlightUtils.jsx';

/**
 * Component for displaying a dictionary word entry styled like search results
 * @param {object} props Component props
 * @param {object} props.word Word object with word data
 * @param {boolean} [props.compact=false] Whether to show the word in compact format
 * @param {string} [props.searchTerm] Search term to highlight in the word
 */
const WordCard = ({ word, compact = false, searchTerm = "" }) => {
  if (!word) return null;

  if (compact) {
    return (
      <Link
        to={`/word/${word.id}`}
        className="block p-3 rounded-lg hover:bg-base-200 transition-all border-l-4 border-transparent hover:border-primary"
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-primary">
              {searchTerm ? highlightText(word.kurukh_word, searchTerm) : word.kurukh_word}
            </h3>
            {word.meanings && word.meanings.length > 0 && (
              <p className="text-neutral-content text-sm mt-1 line-clamp-1">
                {searchTerm ? highlightText(word.meanings[0].definition, searchTerm) : word.meanings[0].definition}
              </p>
            )}
          </div>
          <div className="ml-2" onClick={(e) => e.preventDefault()}>
            <LikeButton word={word} size="sm" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className={`card bg-base-100 shadow-xl ${compact ? 'card-compact' : ''}`}> {/* Replaced Card */}
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-primary">
                {searchTerm ? highlightText(word.kurukh_word, searchTerm) : word.kurukh_word}
              </h2>
              <PronunciationButton text={word.kurukh_word} />
              {word.part_of_speech && (
                <span className="badge badge-ghost text-xs">
                  {word.part_of_speech.charAt(0).toUpperCase() + word.part_of_speech.slice(1)}
                </span>
              )}
            </div>

            {/* URL-like display similar to search engines */}
            <div className="text-xs text-success mb-2">
              kurukhdictionary.com/word/{word.id}
              {word.createdAt && <span> • {formatDate(word.createdAt)}</span>}
            </div>
          </div>

          <Link
            to={`/word/${word.id}`}
            className="btn btn-xs btn-ghost"
          >
            View Details
          </Link>
        </div>

        {word.meanings && word.meanings.length > 0 && (
          <div className="space-y-2">
            {word.meanings.slice(0, 2).map((meaning, index) => (
              <div key={index} className="text-sm">
                <span className="font-medium text-secondary-content">
                  {meaning.language === 'en' ? 'English' : 'Hindi'}:
                </span>
                <span className="ml-1 text-neutral-content">
                  {searchTerm ? highlightText(meaning.definition, searchTerm) : meaning.definition}
                </span>

                {meaning.example_sentence_kurukh && index === 0 && (
                  <div className="mt-1 text-neutral-content/80 text-xs italic pl-2 border-l-2 border-base-300">
                    "{meaning.example_sentence_kurukh}" - {meaning.example_sentence_translation}
                  </div>
                )}
              </div>
            ))}

            {word.meanings.length > 2 && (
              <div className="text-xs text-accent">
                +{word.meanings.length - 2} more definitions...
              </div>
            )}
          </div>
        )}

        {/* Actions row with share and like buttons */}
        <div className="flex justify-between items-center mt-4 pt-2 border-t border-base-300">
          <ShareWordButtons
            word={word.kurukh_word}
            url={`${window.location.origin}/word/${word.id}`}
            description={word.meanings?.[0]?.definition}
          />
          <LikeButton word={word} size="md" />
        </div>
      </div>
    </div>
  );
};

export default WordCard;
