import React from 'react';

/**
 * Horizontal progress stepper used on the Contribute page (Draft → Community →
 * Editor → Published). Active dot fills with the accent, line is hair-thin.
 */
const Stepper = ({ steps, activeIndex = 0 }) => (
  <div
    className="flex items-center kd-font-sans"
    style={{ fontSize: 13, color: 'var(--kd-ink-soft)' }}
  >
    {steps.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center gap-1.5">
          <span
            aria-current={i === activeIndex ? 'step' : undefined}
            style={{
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: i === activeIndex ? 'var(--kd-accent)' : 'transparent',
              border: i === activeIndex ? 'none' : '1.5px solid var(--kd-line)',
            }}
          />
          <span
            className="kd-font-sans"
            style={{
              fontSize: 11,
              fontWeight: i === activeIndex ? 600 : 500,
              color: i === activeIndex ? 'var(--kd-accent)' : 'var(--kd-ink-mute)',
              letterSpacing: '0.04em',
            }}
          >
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <span
            aria-hidden="true"
            style={{
              width: 32,
              height: 1.5,
              background: 'var(--kd-line)',
              marginBottom: 18,
              marginInline: 4,
            }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default Stepper;
