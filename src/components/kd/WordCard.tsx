import type { CSSProperties, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { highlightText } from '../../utils/highlightUtils';
import { IconSpeaker } from './icons';
import type { Meaning, Word } from '../../types';

export type WordCardVariant = 'row' | 'card' | 'hero' | 'preview';

type WordLike = Partial<Word> & {
  kurukh_word: string;
  meanings?: Meaning[];
  pronunciation?: string;
  pronunciation_guide?: string;
};

export interface WordCardProps {
  word: WordLike | null | undefined;

  /** Density / framing. Default 'card'. */
  variant?: WordCardVariant;

  /** Where the headline (and, for 'row', the whole card) should link to.
   *  `false` to disable linking entirely. Default: `/word/<word.id>` when an id is present. */
  linkTo?: string | false;

  /** Search term to highlight inside the kurukh word and first definition. */
  highlightTerm?: string;

  /** Cap the number of meanings rendered. Default: render all. */
  meaningsLimit?: number;

  /** Variant-overridable toggles. Each defaults to the variant's natural choice. */
  showMeta?: boolean;
  showAudio?: boolean;
  showExamples?: boolean;

  /** Strip the variant's container chrome (background, border, padding, radius).
   *  Useful when embedding the card inside a larger framed surface (e.g. a
   *  2-column review row that supplies its own background). Typography and
   *  internal spacing are unaffected. */
  unstyled?: boolean;

  /** Slots — extras placed at fixed regions of the card. */
  eyebrow?: ReactNode;       // top label row (status pill, "Word of the day", etc.)
  headlineEnd?: ReactNode;   // right side of the headline (like button, etc.)
  metaEnd?: ReactNode;       // right side of the contributor/date line (status pill, etc.)
  actions?: ReactNode;       // bottom action row (share, like, etc.)
  footer?: ReactNode;        // below actions (vote panel, admin controls, comments)

  /** Extra content lines for the meta row (contributor name, dates, …). */
  meta?: ReactNode;

  /** Audio click handler. If omitted and showAudio is true, the button is decorative. */
  onAudioClick?: () => void;

  className?: string;
  style?: CSSProperties;
}

interface VariantConfig {
  showMeta: boolean;
  showAudio: boolean;
  showExamples: boolean;
  container: CSSProperties;
  headlineSize: string | number;
  glossSize: number;
  definitionSize: number;
  exampleSize: number;
  prefersRowLayout: boolean;
}

const VARIANTS: Record<WordCardVariant, VariantConfig> = {
  row: {
    showMeta: false,
    showAudio: false,
    showExamples: false,
    container: {
      padding: '16px 0',
      borderTop: '1px solid var(--kd-line)',
    },
    headlineSize: 24,
    glossSize: 16,
    definitionSize: 16,
    exampleSize: 14,
    prefersRowLayout: true,
  },
  card: {
    showMeta: true,
    showAudio: true,
    showExamples: true,
    container: {
      background: 'var(--kd-surface)',
      border: '1px solid var(--kd-line)',
      borderRadius: 20,
      padding: '24px 28px',
    },
    headlineSize: 'clamp(34px, 4vw, 44px)',
    glossSize: 16,
    definitionSize: 18,
    exampleSize: 16,
    prefersRowLayout: false,
  },
  hero: {
    showMeta: false,
    showAudio: true,
    showExamples: true,
    container: {
      background: 'transparent',
      padding: 0,
    },
    headlineSize: 'clamp(44px, 7vw, 78px)',
    glossSize: 18,
    definitionSize: 22,
    exampleSize: 17,
    prefersRowLayout: false,
  },
  preview: {
    showMeta: false,
    showAudio: true,
    showExamples: true,
    container: {
      background: 'var(--kd-surface)',
      border: '1.5px dashed var(--kd-line)',
      borderRadius: 20,
      padding: '24px 28px',
    },
    headlineSize: 'clamp(30px, 3.5vw, 40px)',
    glossSize: 15,
    definitionSize: 17,
    exampleSize: 15,
    prefersRowLayout: false,
  },
};

const WordCard = ({
  word,
  variant = 'card',
  linkTo,
  highlightTerm = '',
  meaningsLimit,
  showMeta,
  showAudio,
  showExamples,
  unstyled = false,
  eyebrow,
  headlineEnd,
  metaEnd,
  actions,
  footer,
  meta,
  onAudioClick,
  className,
  style,
}: WordCardProps) => {
  if (!word) return null;

  const cfg = VARIANTS[variant];
  const resolvedShowMeta = showMeta ?? cfg.showMeta;
  const resolvedShowAudio = showAudio ?? cfg.showAudio;
  const resolvedShowExamples = showExamples ?? cfg.showExamples;

  const pronunciation = word.pronunciation || word.pronunciation_guide;
  const meanings = word.meanings || [];
  const visibleMeanings =
    typeof meaningsLimit === 'number' ? meanings.slice(0, meaningsLimit) : meanings;
  const hiddenCount = meanings.length - visibleMeanings.length;

  const resolvedLink =
    linkTo === false
      ? null
      : linkTo ?? (word.id ? `/word/${word.id}` : null);

  // The whole component renders into a single container element. For 'row',
  // we make that container a Link if linkTo is provided; for other variants
  // the link is scoped to the headline only.
  const containerStyle: CSSProperties = unstyled ? { ...style } : { ...cfg.container, ...style };

  const body = (
    <>
      {eyebrow && <div className="mb-3">{eyebrow}</div>}

      {cfg.prefersRowLayout ? (
        <RowLayout
          word={word}
          highlightTerm={highlightTerm}
          pronunciation={pronunciation}
          headlineEnd={headlineEnd}
          cfg={cfg}
        />
      ) : (
        <CardLayout
          word={word}
          highlightTerm={highlightTerm}
          pronunciation={pronunciation}
          resolvedLink={resolvedLink}
          showAudio={resolvedShowAudio}
          onAudioClick={onAudioClick}
          headlineEnd={headlineEnd}
          cfg={cfg}
        />
      )}

      {resolvedShowMeta && (meta || metaEnd) && (
        <div
          className="mt-3 flex items-center gap-3 flex-wrap kd-font-sans"
          style={{ fontSize: 13, color: 'var(--kd-ink-mute)' }}
        >
          <div className="flex-1 min-w-0">{meta}</div>
          {metaEnd && <div className="flex items-center gap-2">{metaEnd}</div>}
        </div>
      )}

      {visibleMeanings.length > 0 && !cfg.prefersRowLayout && (
        <div className="mt-5 flex flex-col gap-4">
          {visibleMeanings.map((m, i) => (
            <MeaningBlock
              key={i}
              meaning={m}
              index={i}
              showExample={resolvedShowExamples}
              highlightTerm={highlightTerm}
              definitionSize={cfg.definitionSize}
              exampleSize={cfg.exampleSize}
            />
          ))}
          {hiddenCount > 0 && (
            <div
              className="kd-font-mono"
              style={{
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--kd-ink-mute)',
              }}
            >
              +{hiddenCount} more {hiddenCount === 1 ? 'definition' : 'definitions'}
            </div>
          )}
        </div>
      )}

      {actions && <div className="mt-5">{actions}</div>}
      {footer && <div className="mt-5">{footer}</div>}
    </>
  );

  if (cfg.prefersRowLayout && resolvedLink) {
    return (
      <Link
        to={resolvedLink}
        className={className}
        style={{ ...containerStyle, display: 'block', textDecoration: 'none' }}
      >
        {body}
      </Link>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {body}
    </div>
  );
};

// ─── Sub-blocks ───────────────────────────────────────────────────────────

interface RowLayoutProps {
  word: WordLike;
  highlightTerm: string;
  pronunciation?: string;
  headlineEnd?: ReactNode;
  cfg: VariantConfig;
}

const RowLayout = ({
  word,
  highlightTerm,
  pronunciation,
  headlineEnd,
  cfg,
}: RowLayoutProps) => {
  const gloss = word.meanings?.[0]?.definition;
  return (
    <div
      className="grid items-baseline gap-4"
      style={{ gridTemplateColumns: '1fr auto auto' }}
    >
      <div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span
            className="kd-font-serif"
            style={{
              fontWeight: 500,
              fontSize: cfg.headlineSize,
              color: 'var(--kd-ink)',
              letterSpacing: '-0.01em',
            }}
          >
            {highlightTerm
              ? highlightText(word.kurukh_word, highlightTerm)
              : word.kurukh_word}
          </span>
          {pronunciation && (
            <span
              className="kd-font-mono"
              style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}
            >
              /{pronunciation}/
            </span>
          )}
        </div>
        {gloss && (
          <div
            className="kd-font-serif italic mt-0.5"
            style={{ fontSize: cfg.glossSize, color: 'var(--kd-ink-soft)' }}
          >
            {highlightTerm ? highlightText(gloss, highlightTerm) : gloss}
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

      {headlineEnd}
    </div>
  );
};

interface CardLayoutProps {
  word: WordLike;
  highlightTerm: string;
  pronunciation?: string;
  resolvedLink: string | null;
  showAudio: boolean;
  onAudioClick?: () => void;
  headlineEnd?: ReactNode;
  cfg: VariantConfig;
}

const CardLayout = ({
  word,
  highlightTerm,
  pronunciation,
  resolvedLink,
  showAudio,
  onAudioClick,
  headlineEnd,
  cfg,
}: CardLayoutProps) => {
  const headlineContent = highlightTerm
    ? highlightText(word.kurukh_word, highlightTerm)
    : word.kurukh_word;

  const headlineStyle: CSSProperties = {
    fontWeight: 500,
    fontSize: cfg.headlineSize,
    color: 'var(--kd-ink)',
    letterSpacing: '-0.025em',
    lineHeight: 1,
    margin: 0,
    textDecoration: 'none',
  };

  return (
    <div className="flex items-baseline gap-3 flex-wrap">
      {resolvedLink ? (
        <Link to={resolvedLink} className="kd-font-serif" style={headlineStyle}>
          {headlineContent}
        </Link>
      ) : (
        <h2 className="kd-font-serif" style={headlineStyle}>
          {headlineContent}
        </h2>
      )}

      {pronunciation && (
        <span
          className="kd-font-mono"
          style={{ fontSize: 14, color: 'var(--kd-ink-soft)' }}
        >
          /{pronunciation}/
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
            letterSpacing: '0.04em',
            background: 'var(--kd-accent-tint)',
            color: 'var(--kd-accent)',
          }}
        >
          {word.part_of_speech}
        </span>
      )}

      {showAudio && (
        <button
          type="button"
          onClick={onAudioClick}
          aria-label="play pronunciation"
          className="inline-flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '1px solid var(--kd-line)',
            background: 'var(--kd-bg)',
            color: 'var(--kd-ink)',
            cursor: onAudioClick ? 'pointer' : 'default',
          }}
        >
          <IconSpeaker size={16} />
        </button>
      )}

      {headlineEnd && <div className="ml-auto">{headlineEnd}</div>}
    </div>
  );
};

interface MeaningBlockProps {
  meaning: Meaning;
  index: number;
  showExample: boolean;
  highlightTerm: string;
  definitionSize: number;
  exampleSize: number;
}

const languageLabel = (language: string): string => {
  if (language === 'hi') return 'Hindi';
  if (language === 'en') return 'English';
  return language;
};

const MeaningBlock = ({
  meaning,
  showExample,
  highlightTerm,
  definitionSize,
  exampleSize,
}: MeaningBlockProps) => (
  <div>
    <div className="kd-eyebrow mb-1.5" style={{ color: 'var(--kd-ink-mute)' }}>
      {languageLabel(meaning.language)}
    </div>
    <p
      className="kd-font-serif"
      style={{
        fontSize: definitionSize,
        color: 'var(--kd-ink)',
        lineHeight: 1.5,
        margin: 0,
      }}
    >
      {highlightTerm
        ? highlightText(meaning.definition, highlightTerm)
        : meaning.definition}
    </p>
    {showExample && meaning.example_sentence_kurukh && (
      <div
        className="mt-3 px-4 py-3 rounded-xl"
        style={{
          background: 'var(--kd-bg)',
          border: '1px solid var(--kd-line)',
          borderLeft: '3px solid var(--kd-accent)',
        }}
      >
        <p
          className="kd-font-serif italic"
          style={{
            fontSize: exampleSize,
            color: 'var(--kd-ink)',
            margin: 0,
            lineHeight: 1.45,
          }}
        >
          “{meaning.example_sentence_kurukh}”
        </p>
        {meaning.example_sentence_translation && (
          <p
            className="kd-font-sans mt-1"
            style={{
              fontSize: 13.5,
              color: 'var(--kd-ink-soft)',
              margin: 0,
            }}
          >
            {meaning.example_sentence_translation}
          </p>
        )}
      </div>
    )}
  </div>
);

export default WordCard;
