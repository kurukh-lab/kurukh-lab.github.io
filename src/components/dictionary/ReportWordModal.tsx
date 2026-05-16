import { useEffect, useState, type FormEvent } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportWord } from '../../services/dictionaryService';
import { IconClose } from '../kd/icons';

export interface ReportWordModalProps {
  wordId: string;
  wordText: string;
  isOpen: boolean;
  onClose: () => void;
}

const REASON_OPTIONS: { value: string; label: string }[] = [
  { value: 'incorrect_definition', label: 'Incorrect definition' },
  { value: 'incorrect_spelling', label: 'Incorrect spelling' },
  { value: 'incorrect_example', label: 'Incorrect example' },
  { value: 'inappropriate_content', label: 'Inappropriate content' },
  { value: 'duplicate_word', label: 'Duplicate word' },
  { value: 'other', label: 'Other' },
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

const ReportWordModal = ({ wordId, wordText, isOpen, onClose }: ReportWordModalProps) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setError('You must be logged in to report a word.');
      return;
    }
    if (!reason) {
      setError('Please select a reason for your report.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await reportWord(wordId, currentUser.uid, reason, details);
      if (result.success) {
        setSuccess(true);
        setReason('');
        setDetails('');
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 3000);
      } else {
        throw new Error(result.error || 'Failed to submit report');
      }
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('An error occurred while submitting your report. Please try again.');
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
        className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto"
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
            <div className="kd-eyebrow mb-2">Report an issue</div>
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
              Something off with{' '}
              <em style={{ color: 'var(--kd-accent)', fontStyle: 'italic' }}>
                “{wordText}”
              </em>
              ?
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
              Flag the entry for admin review. Be specific — the more context,
              the faster it gets fixed.
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
            <Notice tone="warn">You must be logged in to report a word.</Notice>
          ) : success ? (
            <Notice tone="success">
              Thank you — your report has been submitted and will be reviewed
              soon.
            </Notice>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {error && <Notice tone="error">{error}</Notice>}

              <Field label="Reason" required htmlFor="report-reason">
                <select
                  id="report-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="kd-font-sans"
                  style={fieldStyle}
                  required
                >
                  <option value="">— Select a reason —</option>
                  {REASON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Additional details"
                hint="Optional"
                htmlFor="report-details"
              >
                <textarea
                  id="report-details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={3}
                  placeholder="Anything else admins should know about this issue?"
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
                Reports are reviewed by admins. If you spotted a specific edit
                instead, prefer "Suggest a correction" — it routes faster.
              </p>

              <div
                className="flex items-center justify-end gap-2 pt-2"
                style={{
                  borderTop: '1px solid var(--kd-line-soft)',
                  marginTop: 4,
                  paddingTop: 16,
                }}
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
                  disabled={submitting || !reason}
                  className="rounded-full px-5 py-2 kd-font-sans text-[13px] font-semibold transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'var(--kd-accent)',
                    color: '#FBF7EE',
                  }}
                >
                  {submitting ? 'Submitting…' : 'Submit report'}
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
        <span style={{ color: 'var(--kd-ink-mute)', letterSpacing: '0.12em' }}>
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

export default ReportWordModal;
