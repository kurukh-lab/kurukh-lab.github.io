import { useTranslation } from 'react-i18next';
import type { PillTone } from './kd/StatusPill';

export interface StateOption {
  value: string;
  label: string;
  tone?: PillTone;
  count?: number;
}

export interface StateFilterProps {
  states: StateOption[];
  selectedStates: string[];
  onSelectionChange: (next: string[]) => void;
  title?: string;
  multiSelect?: boolean;
  disabled?: boolean;
}

const TONE: Record<PillTone, { color: string; bg: string }> = {
  sage: { color: 'var(--kd-sage)', bg: 'color-mix(in srgb, var(--kd-sage) 15%, transparent)' },
  accent: { color: 'var(--kd-accent)', bg: 'var(--kd-accent-tint)' },
  violet: { color: '#7C5BA8', bg: 'color-mix(in srgb, #7C5BA8 15%, transparent)' },
  neutral: { color: 'var(--kd-ink-mute)', bg: 'var(--kd-surface-alt)' },
};

const StateFilter = ({
  states,
  selectedStates,
  onSelectionChange,
  title,
  multiSelect = true,
  disabled = false,
}: StateFilterProps) => {
  const { t } = useTranslation();

  const handleStateToggle = (state: string) => {
    if (disabled) return;
    if (multiSelect) {
      const next = selectedStates.includes(state)
        ? selectedStates.filter((s) => s !== state)
        : [...selectedStates, state];
      onSelectionChange(next);
    } else {
      onSelectionChange([state]);
    }
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onSelectionChange(states.map((s) => s.value));
  };

  const handleClearAll = () => {
    if (disabled) return;
    onSelectionChange([]);
  };

  return (
    <div
      className="p-5 rounded-2xl"
      style={{ background: 'var(--kd-surface)', border: '1px solid var(--kd-line)' }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="kd-eyebrow">{title || t('review.filterTitle')}</div>
        {multiSelect && (
          <div
            className="flex items-center gap-3 kd-font-sans"
            style={{ fontSize: 12, color: 'var(--kd-ink-soft)' }}
          >
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={disabled || selectedStates.length === states.length}
              className="underline disabled:opacity-40"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {t('review.filterSelectAll')}
            </button>
            <span style={{ width: 1, height: 12, background: 'var(--kd-line)' }} />
            <button
              type="button"
              onClick={handleClearAll}
              disabled={disabled || selectedStates.length === 0}
              className="underline disabled:opacity-40"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {t('review.filterClearAll')}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {states.map((state) => {
          const isActive = selectedStates.includes(state.value);
          const tone = (state.tone && TONE[state.tone]) || TONE.neutral;
          return (
            <button
              key={state.value}
              type="button"
              onClick={() => handleStateToggle(state.value)}
              disabled={disabled}
              aria-pressed={isActive}
              className="inline-flex items-center gap-2 kd-font-sans transition-colors disabled:opacity-50"
              style={{
                padding: '6px 14px',
                borderRadius: 999,
                fontSize: 12.5,
                fontWeight: 500,
                cursor: disabled ? 'not-allowed' : 'pointer',
                background: isActive ? tone.bg : 'transparent',
                color: isActive ? tone.color : 'var(--kd-ink-soft)',
                border: `1px solid ${isActive ? 'transparent' : 'var(--kd-line)'}`,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: tone.color,
                  display: 'inline-block',
                }}
              />
              {state.label}
              {state.count !== undefined && (
                <span
                  className="kd-font-mono ml-1"
                  style={{ fontSize: 11, color: 'var(--kd-ink-mute)' }}
                >
                  {state.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {multiSelect && (
        <div
          className="kd-font-mono mt-4"
          style={{
            fontSize: 11,
            color: 'var(--kd-ink-mute)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          {t('review.filterSummary', {
            selected: selectedStates.length,
            total: states.length,
          })}
        </div>
      )}
    </div>
  );
};

export default StateFilter;
