import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { submitCorrection } from '../../services/dictionaryService';
import { IconClose } from '../kd/icons';
import type { CorrectionType, Word } from '../../types';

export interface SuggestCorrectionModalProps {
  wordId: string;
  wordText: string;
  currentWord?: Word | null;
  isOpen: boolean;
  onClose: () => void;
}

const CORRECTION_OPTIONS: { value: CorrectionType; label: string }[] = [
  { value: 'word_spelling', label: 'Word spelling' },
  { value: 'definition', label: 'Definition / meaning' },
  { value: 'part_of_speech', label: 'Part of speech' },
  { value: 'example_sentence', label: 'Example sentence (Kurukh)' },
  { value: 'example_translation', label: 'Example translation' },
  { value: 'pronunciation', label: 'Pronunciation' },
];

const fieldStyle: React.CSSProperties = {
  background: 'var(--kd-bg)',
  border: '1px solid var(--kd-line)',
  borderRadius: 12,
  padding: '10px 12px',
  fontSize: 14,
  color: 'var(--kd-ink)',
  outline: 'none',
  width: '100%',
};

const SuggestCorrectionModal = ({
  wordId,
  wordText,
  currentWord,
  isOpen,
  onClose,
}: SuggestCorrectionModalProps) => {
  const { currentUser } = useAuth();
  const [correctionType, setCorrectionType] = useState<CorrectionType | ''>('');
  const [proposedChange, setProposedChange] = useState('');
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const getCurrentValue = (): string => {
    switch (correctionType) {
      case 'word_spelling':
        return currentWord?.kurukh_word || '';
      case 'definition':
        return currentWord?.meanings?.[0]?.definition || '';
      case 'part_of_speech':
        return currentWord?.part_of_speech || '';
      case 'example_sentence':
        return currentWord?.meanings?.[0]?.example_sentence_kurukh || '';
      case 'example_translation':
        return currentWord?.meanings?.[0]?.example_sentence_translation || '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to suggest a correction.');
      return;
    }
    if (!correctionType || !proposedChange) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitCorrection(wordId, currentUser.uid, {
        type: correctionType as CorrectionType,
        proposedChange,
        explanation,
        currentValue: getCurrentValue(),
      });
      if (result.success) {
        setSuccess(true);
        setCorrectionType('');
        setProposedChange('');
        setExplanation('');
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit correction');
      }
    } catch (err) {
      console.error('Error submitting correction:', err);
      setError('An error occurred while submitting your correction. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-6"
      style={{ background: 'rgba(28, 24, 20, 0.5)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto"
        style={{
          background: 'var(--kd-surface)',
          border: '1px solid var(--kd-line)',
          borderRadius: 20,
          boxShadow: 'var(--kd-shadow-elev)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-4 px-6 pt-6 pb-5"
          style={{ borderBottom: '1px solid var(--kd-line-soft)' }}
        >
          <div className="min-w-0">
            <div className="kd-eyebrow mb-2">Suggest a correction</div>
            <h3
              className="kd-font-serif"
              style={{
                fontSize: 26,
                margin: 0,
                color: 'var(--kd-ink)',
                fontWeight: 500,
                letterSpacing: '-0.01em',
                lineHeight: 1.2,
              }}
            >
              Help refine{' '}
              <em
                style={{ color: 'var(--kd-accent)', fontStyle: 'italic' }}
              >
                “{wordText}”
              </em>
            </h3>
            <p
              className="kd-font-sans mt-1.5"
              style={{
                color: 'var(--kd-ink-soft)',
                fontSize: 13.5,
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              Spotted an error? Send a targeted edit — the community and admins
              will review it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full shrink-0"
            style={{
              color: 'var(--kd-ink-soft)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="px-6 py-5">
          {!currentUser ? (
            <Notice tone="warn">
              You must be logged in to suggest corrections.
            </Notice>
          ) : success ? (
            <Notice tone="success">
              Thank you — your correction has been submitted and will be
              reviewed by the community.
            </Notice>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <Notice tone="error">{error}</Notice>}

              <Field
                label="What would you like to correct?"
                required
                htmlFor="suggest-correction-type"
              >
                <select
                  id="suggest-correction-type"
                  value={correctionType}
                  onChange={(e) =>
                    setCorrectionType(e.target.value as CorrectionType | '')
                  }
                  className="kd-font-sans"
                  style={fieldStyle}
                  required
                >
                  <option value="">— Select what to correct —</option>
                  {CORRECTION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              {correctionType && (
                <Field label="Current value">
                  <div
                    className="kd-font-serif"
                    style={{
                      background:
                        'color-mix(in srgb, #C7522A 8%, var(--kd-surface))',
                      border: '1px solid var(--kd-line)',
                      borderRadius: 12,
                      padding: '10px 12px',
                      fontSize: 15,
                      color: 'var(--kd-ink)',
                      lineHeight: 1.45,
                    }}
                  >
                    {getCurrentValue() || (
                      <span style={{ color: 'var(--kd-ink-mute)' }}>
                        No current value
                      </span>
                    )}
                  </div>
                </Field>
              )}

              <Field
                label="Proposed correction"
                required
                htmlFor="suggest-correction-proposed"
              >
                <textarea
                  id="suggest-correction-proposed"
                  value={proposedChange}
                  onChange={(e) => setProposedChange(e.target.value)}
                  rows={3}
                  placeholder="Enter your suggested correction…"
                  className="kd-font-sans"
                  style={{ ...fieldStyle, resize: 'vertical' }}
                  required
                />
              </Field>

              <Field
                label="Explanation"
                hint="Optional"
                htmlFor="suggest-correction-explanation"
              >
                <textarea
                  id="suggest-correction-explanation"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={2}
                  placeholder="Why is this correction needed? Cite a source or example if you can."
                  className="kd-font-sans"
                  style={{ ...fieldStyle, resize: 'vertical' }}
                />
              </Field>

              <p
                className="kd-font-sans"
                style={{
                  color: 'var(--kd-ink-mute)',
                  fontSize: 12.5,
                  lineHeight: 1.55,
                  margin: 0,
                }}
              >
                Your correction will be queued for community review. Both
                admins and trusted contributors can approve it.
              </p>

              <div
                className="flex items-center justify-end gap-2 pt-2"
                style={{ borderTop: '1px solid var(--kd-line-soft)', marginTop: 4, paddingTop: 16 }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  className="rounded-full px-4 py-2 kd-font-sans text-[13px] font-medium"
                  style={{
                    background: 'transparent',
                    color: 'var(--kd-ink-soft)',
                    border: '1px solid var(--kd-line)',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !correctionType || !proposedChange}
                  className="rounded-full px-5 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--kd-accent)',
                    color: '#FBF7EE',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit correction'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  required?: boolean;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}

const Field = ({ label, required, hint, htmlFor, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={htmlFor}
      className="kd-font-mono flex items-center gap-2"
      style={{
        fontSize: 11,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: 'var(--kd-ink-soft)',
      }}
    >
      <span>{label}</span>
      {required && (
        <span style={{ color: 'var(--kd-accent)', letterSpacing: 0 }}>*</span>
      )}
      {hint && (
        <span
          style={{
            color: 'var(--kd-ink-mute)',
            letterSpacing: '0.12em',
          }}
        >
          · {hint}
        </span>
      )}
    </label>
    {children}
  </div>
);

interface NoticeProps {
  tone: 'success' | 'warn' | 'error';
  children: React.ReactNode;
}

const Notice = ({ tone, children }: NoticeProps) => {
  const palette: Record<NoticeProps['tone'], { bg: string; fg: string }> = {
    success: {
      bg: 'color-mix(in srgb, var(--kd-sage) 14%, var(--kd-surface))',
      fg: 'var(--kd-sage)',
    },
    warn: {
      bg: 'color-mix(in srgb, #FEBC2E 22%, var(--kd-surface))',
      fg: 'var(--kd-ink)',
    },
    error: {
      bg: 'color-mix(in srgb, #C7522A 12%, var(--kd-surface))',
      fg: 'var(--kd-accent)',
    },
  };
  const { bg, fg } = palette[tone];
  return (
    <div
      className="kd-font-sans px-4 py-3"
      style={{
        background: bg,
        color: fg,
        border: '1px solid var(--kd-line)',
        borderRadius: 12,
        fontSize: 13.5,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
};

export default SuggestCorrectionModal;
