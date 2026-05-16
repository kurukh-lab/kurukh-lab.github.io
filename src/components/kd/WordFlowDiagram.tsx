import { useEffect, useMemo, useState } from 'react';
import {
  wordReviewService,
  type WordReviewMachineState,
  type WordReviewContext,
} from '../../services/wordReviewService';

export interface WordFlowDiagramProps {
  wordId: string;
  realTimeUpdates?: boolean;
  className?: string;
}

interface NodeDef {
  id: WordReviewMachineState;
  label: string;
  x: number;
  y: number;
  tone?: 'final-approve' | 'final-reject';
}

interface EdgeDef {
  from: WordReviewMachineState;
  to: WordReviewMachineState;
  /** History `action` value that records this transition. */
  action: string;
  /** Optional control-point offset (perpendicular to the line) for curved back-edges. */
  curveOffset?: number;
  /** Dashed paths for exceptional flows (override / send-back). */
  dashed?: boolean;
}

const NODE_W = 124;
const NODE_H = 52;
const VIEW_W = 940;
const VIEW_H = 460;

const NODES: NodeDef[] = [
  { id: 'draft',                  label: 'Draft',               x:  78, y: 230 },
  { id: 'submitted',              label: 'Submitted',           x: 218, y: 230 },
  { id: 'pendingCommunityReview', label: 'Pending community',   x: 380, y:  90 },
  { id: 'inCommunityReview',      label: 'In community review', x: 540, y:  90 },
  { id: 'communityApproved',      label: 'Community approved',  x: 710, y:  50, tone: 'final-approve' },
  { id: 'communityRejected',      label: 'Community rejected',  x: 710, y: 140, tone: 'final-reject' },
  { id: 'pendingAdminReview',     label: 'Pending admin',       x: 540, y: 360 },
  { id: 'inAdminReview',          label: 'In admin review',     x: 700, y: 360 },
  { id: 'approved',               label: 'Approved',            x: 860, y: 320, tone: 'final-approve' },
  { id: 'rejected',               label: 'Rejected',            x: 860, y: 400, tone: 'final-reject' },
];

const EDGES: EdgeDef[] = [
  { from: 'draft',                  to: 'submitted',              action: 'submitted' },
  { from: 'submitted',              to: 'pendingCommunityReview', action: 'sent_to_community_review' },
  { from: 'submitted',              to: 'pendingAdminReview',     action: 'sent_to_admin_review' },
  { from: 'pendingCommunityReview', to: 'inCommunityReview',      action: 'community_review_started' },
  { from: 'inCommunityReview',      to: 'communityApproved',      action: 'community_approved' },
  { from: 'inCommunityReview',      to: 'communityRejected',      action: 'community_rejected' },
  { from: 'inCommunityReview',      to: 'pendingAdminReview',     action: 'admin_override', curveOffset: 80, dashed: true },
  { from: 'communityApproved',      to: 'pendingAdminReview',     action: 'sent_to_admin_review' },
  { from: 'pendingAdminReview',     to: 'inAdminReview',          action: 'admin_review_started' },
  { from: 'inAdminReview',          to: 'approved',               action: 'admin_approved' },
  { from: 'inAdminReview',          to: 'rejected',               action: 'admin_rejected' },
  { from: 'inAdminReview',          to: 'pendingCommunityReview', action: 'sent_back_to_community', curveOffset: 90, dashed: true },
];

const NODE_BY_ID = new Map(NODES.map((n) => [n.id, n] as const));

/** Trim a line so it ends at the boundary of two centered rectangles, not their centers. */
const trimSegment = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  hw: number,
  hh: number,
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const adx = Math.abs(dx) || 1e-6;
  const ady = Math.abs(dy) || 1e-6;
  const t = adx / hw > ady / hh ? hw / adx : hh / ady;
  return {
    x1: x1 + dx * t,
    y1: y1 + dy * t,
    x2: x2 - dx * t,
    y2: y2 - dy * t,
  };
};

/** Quadratic bezier control point offset perpendicular to the segment. */
const perpendicularControl = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  offset: number,
) => {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  // Perpendicular unit vector (rotate 90° CCW).
  const px = -dy / len;
  const py = dx / len;
  return { cx: mx + px * offset, cy: my + py * offset };
};

interface HistoryEvent {
  action: string;
  timestamp?: unknown;
}

const formatTimestamp = (ts: unknown): string => {
  if (ts && typeof ts === 'object' && 'seconds' in (ts as Record<string, unknown>)) {
    const seconds = (ts as { seconds?: number }).seconds;
    if (typeof seconds === 'number') return new Date(seconds * 1000).toLocaleString();
  }
  if (ts instanceof Date) return ts.toLocaleString();
  return '';
};

const WordFlowDiagram = ({
  wordId,
  realTimeUpdates = true,
  className,
}: WordFlowDiagramProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentState, setCurrentState] = useState<WordReviewMachineState>('submitted');
  const [context, setContext] = useState<Partial<WordReviewContext>>({});

  useEffect(() => {
    const load = async () => {
      if (!wordId) return;
      try {
        setIsLoading(true);
        setError(null);
        const result = await wordReviewService.loadWordStatus(wordId);
        setCurrentState(result.state);
        setContext(result.context);
      } catch (err) {
        console.error('Failed to load word flow:', err);
        setError("Could not load the word's flow");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [wordId]);

  useEffect(() => {
    if (!realTimeUpdates || !wordId) return;
    return wordReviewService.subscribeToWordStatus(wordId, (snapshot) => {
      setCurrentState(snapshot.state);
      setContext(snapshot.context);
    });
  }, [wordId, realTimeUpdates]);

  const history = (context.history || []) as unknown as HistoryEvent[];

  const { visitedStates, visitedEdgeKeys, lastEdgeKey, lastEvent } = useMemo(() => {
    const edgeByAction = new Map<string, EdgeDef>();
    EDGES.forEach((e) => edgeByAction.set(e.action, e));

    const states = new Set<string>([currentState, 'draft']);
    const edgeKeys = new Set<string>();
    let last: string | null = null;
    let lastEvt: HistoryEvent | null = null;
    for (const evt of history) {
      const edge = edgeByAction.get(evt.action);
      if (!edge) continue;
      states.add(edge.from);
      states.add(edge.to);
      const key = `${edge.from}->${edge.to}`;
      edgeKeys.add(key);
      last = key;
      lastEvt = evt;
    }
    return {
      visitedStates: states,
      visitedEdgeKeys: edgeKeys,
      lastEdgeKey: last,
      lastEvent: lastEvt,
    };
  }, [history, currentState]);

  if (isLoading) {
    return (
      <div
        className={className}
        style={{
          fontSize: 11,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--kd-ink-mute)',
        }}
      >
        Loading flow…
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ color: 'var(--kd-accent)', fontSize: 14 }}>
        {error}
      </div>
    );
  }

  const isFinalReject = (id: WordReviewMachineState) =>
    id === 'rejected' || id === 'communityRejected';

  return (
    <div className={className}>
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div className="kd-eyebrow">Lifecycle</div>
        {lastEvent && (
          <div
            className="kd-font-mono"
            style={{
              fontSize: 10.5,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--kd-ink-mute)',
            }}
          >
            Last move · {formatTimestamp(lastEvent.timestamp) || lastEvent.action}
          </div>
        )}
      </div>

      <div className="overflow-x-auto -mx-1 px-1">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="Word review state diagram"
          style={{
            width: '100%',
            minWidth: 720,
            height: 'auto',
            display: 'block',
          }}
        >
          <defs>
            {[
              { id: 'kd-arrow-faint',   color: 'var(--kd-line)' },
              { id: 'kd-arrow-visited', color: 'var(--kd-sage)' },
              { id: 'kd-arrow-active',  color: 'var(--kd-ink)' },
              { id: 'kd-arrow-reject',  color: 'var(--kd-accent)' },
            ].map((m) => (
              <marker
                key={m.id}
                id={m.id}
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 Z" fill={m.color} />
              </marker>
            ))}
          </defs>

          <g>
            {EDGES.map((edge) => {
              const from = NODE_BY_ID.get(edge.from)!;
              const to = NODE_BY_ID.get(edge.to)!;
              const { x1, y1, x2, y2 } = trimSegment(
                from.x,
                from.y,
                to.x,
                to.y,
                NODE_W / 2,
                NODE_H / 2,
              );
              const key = `${edge.from}->${edge.to}`;
              const isVisited = visitedEdgeKeys.has(key);
              const isLast = lastEdgeKey === key;
              const reject = isFinalReject(edge.to);

              let stroke = 'var(--kd-line)';
              let strokeWidth = 1.2;
              let marker = 'kd-arrow-faint';
              let opacity = 0.85;
              if (isLast) {
                stroke = reject ? 'var(--kd-accent)' : 'var(--kd-ink)';
                strokeWidth = 2.2;
                marker = reject ? 'kd-arrow-reject' : 'kd-arrow-active';
                opacity = 1;
              } else if (isVisited) {
                stroke = reject ? 'var(--kd-accent)' : 'var(--kd-sage)';
                strokeWidth = 1.7;
                marker = reject ? 'kd-arrow-reject' : 'kd-arrow-visited';
                opacity = 1;
              }

              const dash = edge.dashed ? '5 4' : undefined;
              const path = edge.curveOffset
                ? (() => {
                    const { cx, cy } = perpendicularControl(x1, y1, x2, y2, edge.curveOffset);
                    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
                  })()
                : `M ${x1} ${y1} L ${x2} ${y2}`;

              return (
                <path
                  key={key}
                  d={path}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dash}
                  opacity={opacity}
                  markerEnd={`url(#${marker})`}
                />
              );
            })}
          </g>

          <g>
            {NODES.map((node) => {
              const isCurrent = node.id === currentState;
              const isVisited = visitedStates.has(node.id);
              const isReject = node.tone === 'final-reject';

              let fill = 'var(--kd-surface)';
              let stroke = 'var(--kd-line)';
              let textColor = 'var(--kd-ink-soft)';
              let strokeWidth = 1;

              if (isCurrent) {
                fill = isReject ? 'var(--kd-accent)' : 'var(--kd-ink)';
                stroke = 'transparent';
                textColor = '#FBF7EE';
                strokeWidth = 0;
              } else if (isVisited) {
                fill = isReject
                  ? 'var(--kd-accent-tint)'
                  : 'color-mix(in srgb, var(--kd-sage) 14%, var(--kd-surface))';
                stroke = isReject ? 'var(--kd-accent)' : 'var(--kd-sage)';
                textColor = 'var(--kd-ink)';
                strokeWidth = 1.2;
              }

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x - NODE_W / 2} ${node.y - NODE_H / 2})`}
                >
                  <rect
                    x={0}
                    y={0}
                    width={NODE_W}
                    height={NODE_H}
                    rx={12}
                    ry={12}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                  />
                  <foreignObject x={0} y={0} width={NODE_W} height={NODE_H}>
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px 10px',
                        textAlign: 'center',
                        fontSize: 12,
                        lineHeight: 1.25,
                        fontFamily:
                          'var(--kd-font-sans, system-ui, -apple-system, sans-serif)',
                        color: textColor,
                        fontWeight: isCurrent ? 600 : 500,
                      }}
                    >
                      {node.label}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      <Legend />
    </div>
  );
};

const Legend = () => (
  <div className="flex flex-wrap items-center gap-4 mt-4">
    <LegendDot color="var(--kd-ink)" label="Current" />
    <LegendDot color="var(--kd-sage)" label="Visited" />
    <LegendDot color="var(--kd-accent)" label="Rejection" />
    <LegendLine dashed label="Exception path" />
  </div>
);

const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <span
    className="inline-flex items-center gap-1.5 kd-font-mono"
    style={{
      fontSize: 10.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--kd-ink-soft)',
    }}
  >
    <span
      aria-hidden="true"
      style={{ width: 10, height: 10, borderRadius: '50%', background: color }}
    />
    {label}
  </span>
);

const LegendLine = ({ dashed, label }: { dashed?: boolean; label: string }) => (
  <span
    className="inline-flex items-center gap-1.5 kd-font-mono"
    style={{
      fontSize: 10.5,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      color: 'var(--kd-ink-soft)',
    }}
  >
    <span
      aria-hidden="true"
      style={{
        width: 22,
        height: 0,
        borderTop: dashed
          ? '1.5px dashed var(--kd-ink-soft)'
          : '1.5px solid var(--kd-ink-soft)',
      }}
    />
    {label}
  </span>
);

export default WordFlowDiagram;
