import React from 'react';
import { useTranslation } from 'react-i18next';

const KURUKH_LETTERS = ['A', 'Ā', 'B', 'C', 'D', 'E', 'Ē', 'G', 'H', 'I', 'Ī', 'J',
  'K', 'Kh', 'L', 'M', 'N', 'Ṅ', 'O', 'P', 'R', 'S', 'T', 'U', 'Ū', 'X'];

const HINDI_LETTERS = ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'क', 'ख',
  'ग', 'घ', 'च', 'छ', 'ज', 'झ', 'ट', 'ठ', 'ड', 'ढ', 'त', 'थ', 'द', 'ध', 'न',
  'प', 'फ', 'ब', 'भ', 'म', 'य', 'र', 'ल', 'व', 'श', 'स', 'ह'];

const AlphabetRibbon = () => {
  const { i18n } = useTranslation();
  const letters = i18n.language?.startsWith('hi') ? HINDI_LETTERS : KURUKH_LETTERS;
  // Highlight the 'B' / 'क' as a subtle anchor — the kind of detail that
  // makes the otherwise-quiet ribbon feel like the active surface of a real app.
  const active = i18n.language?.startsWith('hi') ? 'क' : 'B';

  return (
    <div
      className="flex flex-wrap gap-2 p-5 md:p-6"
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-line)',
        borderRadius: 16,
      }}
    >
      {letters.map(letter => {
        const isActive = letter === active;
        return (
          <button
            key={letter}
            type="button"
            className="kd-font-serif transition-colors"
            style={{
              minWidth: 48,
              height: 48,
              borderRadius: 10,
              background: isActive ? 'var(--kd-accent)' : 'var(--kd-surface-alt)',
              color: isActive ? '#FBF7EE' : 'var(--kd-ink)',
              fontWeight: 500,
              fontSize: 20,
              flex: '1 0 48px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};

export default AlphabetRibbon;
