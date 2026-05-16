import type { ReactNode } from 'react';

export interface SubHeadProps {
  eyebrow: ReactNode;
  title: ReactNode;
  noBottom?: boolean;
}

const SubHead = ({ eyebrow, title, noBottom = false }: SubHeadProps) => (
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
