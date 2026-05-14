import React from 'react';

const SectionLabel = ({ eyebrow, title, right }) => (
  <div className="mb-6">
    <div className="flex items-end justify-between gap-4">
      <div>
        <div className="kd-eyebrow mb-2">{eyebrow}</div>
        <h2
          className="kd-font-serif"
          style={{
            margin: 0,
            fontWeight: 500,
            fontSize: 'clamp(26px, 3.2vw, 36px)',
            letterSpacing: '-0.02em',
            color: 'var(--kd-ink)',
          }}
        >
          {title}
        </h2>
      </div>
      {right}
    </div>
  </div>
);

export default SectionLabel;
