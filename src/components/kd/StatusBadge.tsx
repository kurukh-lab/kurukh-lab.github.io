import type { WordStatus } from '../../types';

interface StatusConfig {
  label: string;
  colorVar: string;
}

const STATUS_CONFIG: Record<WordStatus, StatusConfig> = {
  approved:                 { label: 'Verified',           colorVar: '--kd-sage' },
  community_approved:       { label: 'Community approved', colorVar: '--kd-sage' },
  community_review:         { label: 'Community review',   colorVar: '--kd-accent' },
  in_community_review:      { label: 'Community review',   colorVar: '--kd-accent' },
  pending_community_review: { label: 'Pending review',     colorVar: '--kd-amber' },
  in_admin_review:          { label: 'Admin review',       colorVar: '--kd-accent' },
  submitted:                { label: 'Submitted',          colorVar: '--kd-accent' },
  pending_review:           { label: 'Pending review',     colorVar: '--kd-amber' },
  draft:                    { label: 'Draft',              colorVar: '--kd-ink-mute' },
  community_rejected:       { label: 'Community rejected', colorVar: '--kd-rose' },
  rejected:                 { label: 'Rejected',           colorVar: '--kd-rose' },
};

export interface StatusBadgeProps {
  status: WordStatus | string | undefined;
  showDot?: boolean;
}

const StatusBadge = ({ status, showDot = false }: StatusBadgeProps) => {
  const cfg: StatusConfig =
    STATUS_CONFIG[status as WordStatus] ??
    { label: status ?? 'Unknown', colorVar: '--kd-ink-mute' };

  const color = `var(${cfg.colorVar})`;
  const bg = `color-mix(in srgb, var(${cfg.colorVar}) 13%, transparent)`;

  return (
    <span
      className="kd-font-sans uppercase inline-flex items-center gap-1.5"
      style={{
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.08em',
        background: bg,
        color,
        flexShrink: 0,
      }}
    >
      {showDot && (
        <span
          aria-hidden
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            flexShrink: 0,
          }}
        />
      )}
      {cfg.label}
    </span>
  );
};

export default StatusBadge;
