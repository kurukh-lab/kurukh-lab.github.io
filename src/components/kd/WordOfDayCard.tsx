import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WordCard from './WordCard';
import { IconArrow, IconBookmark } from './icons';
import type { Word } from '../../types';

// Older payloads use snake_case fields not present on the canonical Word
// type; type them as optional extras.
type WordOfDay = Word & {
  pronunciation?: string;
};

export interface WordOfDayCardProps {
  word: WordOfDay | null;
}

const WordOfDayCard = ({ word }: WordOfDayCardProps) => {
  const { t } = useTranslation();
  if (!word) return null;

  const primaryMeaning = word.meanings?.[0];
  const example = primaryMeaning?.example_sentence_kurukh;
  const exampleTr = primaryMeaning?.example_sentence_translation;

  return (
    <div
      className="grid gap-10 md:gap-14 md:grid-cols-[1.1fr_1fr] p-8 md:p-12"
      style={{
        background: 'var(--kd-surface)',
        border: '1px solid var(--kd-line)',
        borderRadius: 20,
        boxShadow: 'var(--kd-shadow-card)',
      }}
    >
      <WordCard
        word={word}
        variant="hero"
        meaningsLimit={1}
        showExamples={false}
        actions={
          <div className="flex gap-2">
            <Link
              to={`/word/${word.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 kd-font-sans text-[14px] font-medium rounded-[10px] transition-opacity hover:opacity-90"
              style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
            >
              {t('home.wordOfDay.readEntry')}
              <IconArrow size={14} color="currentColor" />
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 kd-font-sans text-[14px] font-medium rounded-[10px] transition-colors"
              style={{
                background: 'transparent',
                color: 'var(--kd-ink)',
                border: '1px solid var(--kd-line)',
              }}
            >
              <IconBookmark size={14} />
              {t('home.wordOfDay.save')}
            </button>
          </div>
        }
      />

      <div
        className="flex flex-col justify-center pl-7"
        style={{ borderLeft: `2px solid var(--kd-accent)` }}
      >
        <div className="kd-eyebrow mb-4">{t('home.wordOfDay.inSentence')}</div>
        {example ? (
          <>
            <p
              className="kd-font-serif"
              style={{
                fontSize: 'clamp(22px, 2.4vw, 32px)',
                lineHeight: 1.35,
                color: 'var(--kd-ink)',
                fontStyle: 'italic',
                margin: 0,
                fontWeight: 400,
              }}
            >
              “{example}”
            </p>
            {exampleTr && (
              <p
                className="kd-font-sans mt-4"
                style={{
                  fontSize: 15,
                  color: 'var(--kd-ink-soft)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {exampleTr}
              </p>
            )}
          </>
        ) : (
          <p
            className={primaryMeaning?.language === 'hi' ? 'kd-font-deva' : 'kd-font-serif'}
            style={{
              fontSize: 22,
              lineHeight: 1.5,
              color: 'var(--kd-ink-soft)',
              fontStyle: 'italic',
              margin: 0,
            }}
          >
            {primaryMeaning?.definition}
          </p>
        )}
      </div>
    </div>
  );
};

export default WordOfDayCard;
