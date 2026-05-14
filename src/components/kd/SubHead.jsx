import React from 'react';

/**
 * Two-line section header used inside cards: small terracotta eyebrow on top,
 * larger serif title below. Mirrors the SubHead component in the design canvas.
 */
const SubHead = ({ eyebrow, title, noBottom = false }) => (
  <div style={{ marginBottom: noBottom ? 0 : 20 }}>
    <div className="kd-eyebrow mb-1.5">{eyebrow}</div>
    <h3
      className="kd-font-serif"
      style={{
        fontWeight: 500,
        fontSize: 22,
        color: 'var(--kd-ink)',
        margin: 0,
        letterSpacing: '-0.01em',
      }}
    >
      {title}
    </h3>
  </div>
);

export default SubHead;
