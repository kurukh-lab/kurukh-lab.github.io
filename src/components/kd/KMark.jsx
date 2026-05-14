import React from 'react';

const KMark = ({ size = 38, color = 'var(--kd-accent)' }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <rect x="0" y="0" width="40" height="40" rx="9" fill={color} />
    <path d="M12 9 V31 M12 20 L24 9 M12 20 L26 31"
      stroke="#FBF7EE" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="32" cy="11" r="2.2" fill="#FBF7EE" />
  </svg>
);

export default KMark;
