import React from 'react';
import { Link } from 'react-router-dom';
import { IconHeart } from './icons';

/**
 * A single editorial-style word row used in the recent / most-loved lists on
 * the home page. Serif headword, soft italic gloss, pill for part of speech,
 * monospace like count. First row in a list omits the top border.
 */
const WordRow = ({ word, isFirst = false }) => {
  if (!word) return null;
  const gloss = word.meanings?.[0]?.definition;

  return (
    <Link
      to={`/word/${word.id}`}
      className="grid items-baseline gap-4 py-4 transition-colors"
      style={{
        gridTemplateColumns: '1fr auto auto',
        borderTop: isFirst ? 'none' : '1px solid var(--kd-line)',
      }}
    >
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="kd-font-serif"
            style={{
              fontWeight: 500,
              fontSize: 24,
              color: 'var(--kd-ink)',
              letterSpacing: '-0.01em',
            }}
          >
            {word.kurukh_word}
          </span>
          {word.pronunciation && (
            <span className="kd-font-mono" style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}>
              /{word.pronunciation}/
            </span>
          )}
        </div>
        {gloss && (
          <div
            className="kd-font-serif italic mt-0.5"
            style={{ fontSize: 16, color: 'var(--kd-ink-soft)' }}
          >
            {gloss}
          </div>
        )}
      </div>

      {word.part_of_speech && (
        <span
          className="kd-font-sans"
          style={{
            fontSize: 11,
            color: 'var(--kd-ink-mute)',
            padding: '3px 8px',
            borderRadius: 999,
            border: '1px solid var(--kd-line)',
            textTransform: 'lowercase',
          }}
        >
          {word.part_of_speech}
        </span>
      )}

      <span
        className="kd-font-mono inline-flex items-center gap-1.5"
        style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}
      >
        <IconHeart size={13} color="var(--kd-accent)" fill="var(--kd-accent)" />
        {typeof word.likes === 'number' ? word.likes : (word.likes_count ?? 0)}
      </span>
    </Link>
  );
};

export default WordRow;
