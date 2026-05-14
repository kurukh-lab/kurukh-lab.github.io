import React from 'react';

/**
 * Five-slot approval tracker from the design: large sage count over /5,
 * a thin progress bar, then a row of voter-initial avatars followed by
 * dashed placeholder circles for the votes still needed.
 */
const VoteTracker = ({ approvals = 0, needed = 5, voterInitials = [], label = 'Approvals' }) => {
  const filled = Math.min(approvals, needed);
  const remaining = Math.max(0, needed - filled);
  const pct = (filled / needed) * 100;

  return (
    <div
      className="p-3.5 rounded-xl"
      style={{ background: 'var(--kd-bg)', border: '1px solid var(--kd-line)' }}
    >
      <div
        className="kd-font-mono mb-2"
        style={{ fontSize: 10, color: 'var(--kd-ink-mute)', letterSpacing: '0.2em', textTransform: 'uppercase' }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="kd-font-serif"
          style={{ fontSize: 32, fontWeight: 500, color: 'var(--kd-sage)', lineHeight: 1, letterSpacing: '-0.02em' }}
        >
          {filled}
        </span>
        <span className="kd-font-serif" style={{ fontSize: 18, color: 'var(--kd-ink-mute)' }}>
          / {needed}
        </span>
      </div>
      <div
        className="mt-2.5 h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--kd-surface-alt)' }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--kd-sage)' }} />
      </div>
      <div className="mt-3 flex items-center">
        {Array.from({ length: filled }).map((_, i) => (
          <span
            key={`v${i}`}
            className="kd-font-serif inline-flex items-center justify-center"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: i % 2 ? 'var(--kd-sage-soft)' : 'var(--kd-accent-soft)',
              color: '#FFF',
              fontWeight: 600,
              fontSize: 10,
              border: '2px solid var(--kd-surface)',
              marginLeft: i ? -6 : 0,
            }}
          >
            {voterInitials[i] || '·'}
          </span>
        ))}
        {Array.from({ length: remaining }).map((_, i) => (
          <span
            key={`e${i}`}
            aria-hidden="true"
            style={{
              width: 22,
              height: 22,
              borderRadius: '50%',
              background: 'transparent',
              border: '1.5px dashed var(--kd-line)',
              marginLeft: filled + i ? -6 : 0,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default VoteTracker;
