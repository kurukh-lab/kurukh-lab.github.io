import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AlphabetRibbon from '../components/kd/AlphabetRibbon';
import WordRow from '../components/kd/WordRow';
import SectionLabel from '../components/kd/SectionLabel';
import { getWordsByLetter } from '../services/dictionaryService';
import type { Word } from '../types';

const Lexicon = () => {
  const { letter } = useParams<{ letter: string }>();
  const { t } = useTranslation();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentLetter = letter || 'A';

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getWordsByLetter(currentLetter);
        setWords(data);
      } catch (err) {
        console.error('Error fetching words by letter:', err);
        setError(t('errors.loadDictionary') as string);
      } finally {
        setLoading(false);
      }
    };
    fetchWords();
  }, [currentLetter, t]);

  return (
    <div
      style={{
        background: 'var(--kd-bg)',
        color: 'var(--kd-ink)',
        minHeight: '100vh',
      }}
    >
      {/* Hero Section */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-12 md:pt-16 pb-8">
        {/* Breadcrumbs */}
        <nav
          className="flex items-center gap-2 mb-6 kd-font-sans"
          style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
        >
          <Link to="/" className="hover:underline transition-opacity">
            {t('nav.home')}
          </Link>
          <span>/</span>
          <span style={{ color: 'var(--kd-ink-soft)' }}>
            {t('lexicon.breadcrumb')}
          </span>
          <span>/</span>
          <span style={{ color: 'var(--kd-accent)', fontWeight: 500 }}>
            {currentLetter}
          </span>
        </nav>

        <h1
          className="kd-font-serif"
          style={{
            fontWeight: 500,
            fontSize: 'clamp(36px, 6vw, 64px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            margin: 0,
            color: 'var(--kd-ink)',
          }}
        >
          {t('lexicon.title', { letter: currentLetter })}
        </h1>

        <p
          className="kd-font-serif mt-3"
          style={{
            fontSize: 'clamp(15px, 1.4vw, 19px)',
            lineHeight: 1.5,
            color: 'var(--kd-ink-soft)',
            maxWidth: 600,
            margin: '12px 0 0 0',
          }}
        >
          {t('lexicon.subtitle')}
        </p>
      </section>

      {/* Alphabet Selection Section */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-14 py-4">
        <AlphabetRibbon activeLetter={currentLetter} />
      </section>

      {/* Lexicon Content List */}
      <section className="max-w-[1200px] mx-auto px-6 md:px-14 pt-6 pb-24">
        <SectionLabel
          eyebrow={t('home.alphabet.eyebrow')}
          title={currentLetter}
          right={
            <span
              className="kd-font-sans"
              style={{ fontSize: 13, color: 'var(--kd-ink-soft)' }}
            >
              {t('lexicon.totalCount', { count: words.length })}
            </span>
          }
        />

        {error && (
          <div
            role="alert"
            className="kd-font-sans px-4 py-3 rounded-xl mb-6"
            style={{
              background: 'var(--kd-accent-tint)',
              color: 'var(--kd-accent)',
              border: '1px solid var(--kd-accent)',
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <span
              className="loading loading-spinner loading-lg"
              style={{ color: 'var(--kd-accent)' }}
            ></span>
          </div>
        ) : words.length > 0 ? (
          <div
            className="flex flex-col p-6 md:p-8"
            style={{
              background: 'var(--kd-surface)',
              border: '1px solid var(--kd-line)',
              borderRadius: 20,
              boxShadow: 'var(--kd-shadow-card)',
            }}
          >
            {words.map((w, i) => (
              <WordRow key={w.id || i} word={w} isFirst={i === 0} />
            ))}
          </div>
        ) : (
          <div
            className="text-center py-20 px-6 rounded-2xl"
            style={{
              background: 'var(--kd-surface-alt)',
              border: '1px dashed var(--kd-line)',
            }}
          >
            <h3
              className="kd-font-serif text-xl font-medium mb-2"
              style={{ color: 'var(--kd-ink)' }}
            >
              {t('lexicon.noWords')}
            </h3>
            <Link
              to="/"
              className="kd-font-sans text-sm font-medium hover:underline transition-opacity"
              style={{ color: 'var(--kd-accent)' }}
            >
              {t('lexicon.backHome')}
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default Lexicon;
