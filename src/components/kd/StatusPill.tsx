import type { ReactNode } from 'react';

export type PillTone = 'sage' | 'accent' | 'violet' | 'neutral';

const TONE: Record<PillTone, { color: string; bg: string }> = {
  sage: {
    color: 'var(--kd-sage)',
    bg: 'color-mix(in srgb, var(--kd-sage) 15%, transparent)',
  },
  accent: { color: 'var(--kd-accent)', bg: 'var(--kd-accent-tint)' },
  violet: {
    color: '#7C5BA8',
    bg: 'color-mix(in srgb, #7C5BA8 15%, transparent)',
  },
  neutral: { color: 'var(--kd-ink-mute)', bg: 'var(--kd-surface-alt)' },
};

export interface StatusPillProps {
  tone?: PillTone;
  children: ReactNode;
}

const StatusPill = ({ tone = 'neutral', children }: StatusPillProps) => {
  const { color, bg } = TONE[tone] || TONE.neutral;
  return (
    <span
      className="inline-flex items-center gap-2 kd-font-sans"
      style={{
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        color,
        background: bg,
      }}
    >
      <span
        aria-hidden="true"
        style={{ width: 6, height: 6, borderRadius: '50%', background: color }}
      />
      {children}
    </span>
  );
};

export default StatusPill;
