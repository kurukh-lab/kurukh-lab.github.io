import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconSpeaker, IconArrow, IconBookmark } from './icons';
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
      <div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <h3
            className="kd-font-serif"
            style={{
              fontWeight: 500,
              fontSize: 'clamp(56px, 7vw, 88px)',
              margin: 0,
              color: 'var(--kd-ink)',
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}
          >
            {word.kurukh_word}
          </h3>
          <button
            type="button"
            className="inline-flex items-center justify-center w-11 h-11 rounded-full transition-colors"
            style={{ background: 'var(--kd-surface-alt)', color: 'var(--kd-ink)' }}
            aria-label="play pronunciation"
          >
            <IconSpeaker size={20} weight={1.6} />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-3 flex-wrap">
          {word.pronunciation && (
            <span
              className="kd-font-mono"
              style={{ fontSize: 15, color: 'var(--kd-ink-soft)' }}
            >
              /{word.pronunciation}/
            </span>
          )}
          {word.part_of_speech && (
            <span
              className="kd-font-sans"
              style={{
                padding: '3px 10px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 500,
                background: 'var(--kd-accent-tint)',
                color: 'var(--kd-accent)',
                letterSpacing: '0.04em',
              }}
            >
              {word.part_of_speech}
            </span>
          )}
        </div>

        {primaryMeaning?.definition && (
          <p
            className="kd-font-serif"
            style={{
              fontSize: 26,
              color: 'var(--kd-ink)',
              fontStyle: 'italic',
              fontWeight: 400,
              marginTop: 28,
              marginBottom: 0,
              lineHeight: 1.35,
            }}
          >
            {primaryMeaning.definition}
          </p>
        )}

        <div className="flex gap-2 mt-7">
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
      </div>

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
            className="kd-font-serif"
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
