import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IconClose } from './icons';

/**
 * Approve/Reject confirmation modal with an optional comment field.
 * `vote` is "approve" | "reject" — drives the title, accent color, and confirm button.
 */
const CommentModal = ({ open, vote, comment, onCommentChange, onConfirm, onCancel, submitting }) => {
  const { t } = useTranslation();
  const dialogRef = useRef(null);

  // Close on Escape — the modal is a leaf element with no router escape hatch otherwise
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  // Focus the textarea on open so users can start typing immediately
  useEffect(() => {
    if (open && dialogRef.current) {
      const textarea = dialogRef.current.querySelector('textarea');
      textarea?.focus();
    }
  }, [open]);

  if (!open) return null;

  const isApprove = vote === 'approve';
  const accent = isApprove ? 'var(--kd-sage)' : 'var(--kd-accent)';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'color-mix(in srgb, var(--kd-ink) 50%, transparent)' }}
      onClick={onCancel}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-2xl"
        style={{
          background: 'var(--kd-surface)',
          border: '1px solid var(--kd-line)',
          boxShadow: 'var(--kd-shadow-elev)',
        }}
      >
        <div className="flex items-start justify-between gap-4 p-6 pb-3">
          <div>
            <div className="kd-eyebrow mb-1.5" style={{ color: accent }}>
              {isApprove ? t('review.modal.confirmApprove') : t('review.modal.confirmReject')}
            </div>
            <h3
              className="kd-font-serif"
              style={{ fontWeight: 500, fontSize: 24, color: 'var(--kd-ink)', letterSpacing: '-0.015em', margin: 0 }}
            >
              {isApprove ? t('review.modal.approveTitle') : t('review.modal.rejectTitle')}
            </h3>
            <p className="kd-font-sans mt-2" style={{ fontSize: 13, color: 'var(--kd-ink-soft)', margin: 0, marginTop: 8 }}>
              {isApprove ? t('review.modal.approveBody') : t('review.modal.rejectBody')}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label={t('review.modal.cancel')}
            className="inline-flex items-center justify-center rounded-md p-1.5"
            style={{ color: 'var(--kd-ink-mute)' }}
          >
            <IconClose size={16} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <label className="kd-font-sans block mb-1.5" style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--kd-ink-soft)', letterSpacing: '0.02em' }}>
            {t('review.modal.commentLabel')}
          </label>
          <textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            rows={3}
            placeholder={t('review.modal.commentPlaceholder')}
            className="kd-font-serif w-full outline-none"
            style={{
              background: 'var(--kd-bg)',
              color: 'var(--kd-ink)',
              border: '1px solid var(--kd-line)',
              borderRadius: 10,
              padding: '12px 14px',
              fontSize: 15,
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />

          <div className="flex justify-end gap-2 mt-5">
            <button
              type="button"
              onClick={onCancel}
              className="kd-font-sans px-4 py-2.5 rounded-[10px] text-[14px] font-medium"
              style={{ background: 'transparent', color: 'var(--kd-ink)', border: '1px solid var(--kd-line)' }}
            >
              {t('review.modal.cancel')}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={submitting}
              className="kd-font-sans px-4 py-2.5 rounded-[10px] text-[14px] font-semibold disabled:opacity-60"
              style={{ background: accent, color: '#FBF7EE' }}
            >
              {submitting
                ? '…'
                : isApprove
                  ? t('review.modal.confirmApprove')
                  : t('review.modal.confirmReject')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal;
