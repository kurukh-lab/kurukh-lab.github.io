import { createMachine, assign } from 'xstate';
import type { Word } from '../types';

/**
 * XState machine for the word review process.
 *
 * Models the lifecycle of a contributed word: draft → submitted → community
 * review → admin review → approved/rejected. See ARCHITECTURE.md §5 for the
 * surrounding integration with Firestore via wordReviewService.
 */

export interface CommunityVotes {
  for: number;
  against: number;
}

export interface ReviewEntry {
  userId?: string;
  user_id?: string;
  vote: 'approve' | 'reject';
  timestamp?: unknown;
}

export interface CorrectionEntry {
  id: string;
  userId: string;
  correctionType: string;
  currentValue: string;
  proposedChange: string;
  explanation: string;
  createdAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  handledBy?: string;
  handledAt?: Date;
}

export interface ReportEntry {
  id: string;
  userId: string;
  reason: string;
  details: string;
  createdAt: Date;
  status: 'open' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface HistoryEntry {
  action: string;
  timestamp: Date;
  userId?: string;
  reason?: string;
  reportId?: string;
  correctionId?: string;
}

export interface WordReviewMachineContext {
  wordId: string | null;
  wordData: Partial<Word> | null;
  corrections: CorrectionEntry[];
  reports: ReportEntry[];
  communityVotes: CommunityVotes;
  reviewedBy: ReviewEntry[];
  history: HistoryEntry[];
}

export type WordReviewEvent =
  | { type: 'SUBMIT' }
  | { type: 'SEND_TO_ADMIN_REVIEW' }
  | { type: 'SEND_TO_COMMUNITY_REVIEW' }
  | { type: 'START_COMMUNITY_REVIEW' }
  | { type: 'COMMUNITY_APPROVE'; userId: string }
  | { type: 'COMMUNITY_REJECT'; userId: string }
  | { type: 'COMMUNITY_APPROVED' }
  | { type: 'COMMUNITY_REJECTED' }
  | { type: 'ADMIN_OVERRIDE'; userId: string; reason?: string }
  | { type: 'REPORT_SUBMITTED'; reportId: string; userId: string; reason: string; details: string }
  | {
      type: 'CORRECTION_SUBMITTED';
      correctionId: string;
      userId: string;
      correctionType: string;
      currentValue: string;
      proposedChange: string;
      explanation: string;
    }
  | { type: 'START_ADMIN_REVIEW' }
  | { type: 'ADMIN_APPROVE'; userId: string }
  | { type: 'ADMIN_REJECT'; userId: string }
  | { type: 'SEND_BACK_TO_COMMUNITY'; userId: string; reason?: string }
  | { type: 'RESOLVE_REPORT'; reportId: string; userId: string }
  | { type: 'HANDLE_CORRECTION'; correctionId: string; userId: string; action: 'approved' | 'rejected' }
  | { type: 'SYNC_STATE'; state: string; context: Partial<WordReviewMachineContext> }
  | { type: 'UPDATE_WORD_DATA'; data: Partial<Word> };

export interface WordReviewMachineInput {
  wordId?: string | null;
  wordData?: Partial<Word> | null;
}

// History entries are written by many state-specific handlers; each handler
// narrows the event type to a single variant. Typing `historyAction` once
// for all variants is harder than letting XState's per-transition narrowing
// do the work, so we keep this helper loosely-typed and rely on runtime
// shape (which the machine itself guarantees).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const historyAction = (action: string): any =>
  assign({
    history: ({ context, event }: { context: WordReviewMachineContext; event: WordReviewEvent }) => [
      ...context.history,
      {
        action,
        timestamp: new Date(),
        ...('userId' in event ? { userId: (event as { userId: string }).userId } : {}),
        ...('reason' in event ? { reason: (event as { reason?: string }).reason } : {}),
      },
    ],
  });

export const wordReviewMachine = createMachine({
  id: 'wordReview',
  types: {} as {
    context: WordReviewMachineContext;
    events: WordReviewEvent;
    input: WordReviewMachineInput;
  },
  context: ({ input }) => ({
    wordId: input?.wordId ?? null,
    wordData: input?.wordData ?? null,
    corrections: [],
    reports: [],
    communityVotes: { for: 0, against: 0 },
    reviewedBy: [],
    history: [],
  }),
  initial: 'draft',
  states: {
    draft: {
      on: { SUBMIT: { target: 'submitted', actions: historyAction('submitted') } },
    },
    submitted: {
      on: {
        SEND_TO_ADMIN_REVIEW: {
          target: 'pendingAdminReview',
          actions: historyAction('sent_to_admin_review'),
        },
        SEND_TO_COMMUNITY_REVIEW: {
          target: 'pendingCommunityReview',
          actions: historyAction('sent_to_community_review'),
        },
      },
    },
    pendingCommunityReview: {
      on: {
        START_COMMUNITY_REVIEW: {
          target: 'inCommunityReview',
          actions: historyAction('community_review_started'),
        },
      },
    },
    inCommunityReview: {
      on: {
        COMMUNITY_APPROVE: {
          actions: [
            assign({
              communityVotes: ({ context }) => ({
                ...context.communityVotes,
                for: context.communityVotes.for + 1,
              }),
              reviewedBy: ({ context, event }) => [
                ...context.reviewedBy,
                { userId: event.userId, vote: 'approve', timestamp: new Date() },
              ],
            }),
            historyAction('community_approve'),
          ],
        },
        COMMUNITY_REJECT: {
          actions: [
            assign({
              communityVotes: ({ context }) => ({
                ...context.communityVotes,
                against: context.communityVotes.against + 1,
              }),
              reviewedBy: ({ context, event }) => [
                ...context.reviewedBy,
                { userId: event.userId, vote: 'reject', timestamp: new Date() },
              ],
            }),
            historyAction('community_reject'),
          ],
        },
        COMMUNITY_APPROVED: {
          target: 'communityApproved',
          actions: historyAction('community_approved'),
        },
        COMMUNITY_REJECTED: {
          target: 'communityRejected',
          actions: historyAction('community_rejected'),
        },
        ADMIN_OVERRIDE: {
          target: 'pendingAdminReview',
          actions: historyAction('admin_override'),
        },
        REPORT_SUBMITTED: {
          actions: [
            assign({
              reports: ({ context, event }) => [
                ...context.reports,
                {
                  id: event.reportId,
                  userId: event.userId,
                  reason: event.reason,
                  details: event.details,
                  createdAt: new Date(),
                  status: 'open' as const,
                },
              ],
            }),
            historyAction('report_submitted'),
          ],
        },
        CORRECTION_SUBMITTED: {
          actions: [
            assign({
              corrections: ({ context, event }) => [
                ...context.corrections,
                {
                  id: event.correctionId,
                  userId: event.userId,
                  correctionType: event.correctionType,
                  currentValue: event.currentValue,
                  proposedChange: event.proposedChange,
                  explanation: event.explanation,
                  createdAt: new Date(),
                  status: 'pending' as const,
                },
              ],
            }),
            historyAction('correction_submitted'),
          ],
        },
      },
    },
    communityApproved: {
      on: {
        SEND_TO_ADMIN_REVIEW: {
          target: 'pendingAdminReview',
          actions: historyAction('sent_to_admin_review'),
        },
      },
    },
    communityRejected: { type: 'final' },
    pendingAdminReview: {
      on: {
        START_ADMIN_REVIEW: {
          target: 'inAdminReview',
          actions: historyAction('admin_review_started'),
        },
      },
    },
    inAdminReview: {
      on: {
        ADMIN_APPROVE: {
          target: 'approved',
          actions: historyAction('admin_approved'),
        },
        ADMIN_REJECT: {
          target: 'rejected',
          actions: historyAction('admin_rejected'),
        },
        SEND_BACK_TO_COMMUNITY: {
          target: 'pendingCommunityReview',
          actions: historyAction('sent_back_to_community'),
        },
        RESOLVE_REPORT: {
          actions: [
            assign({
              reports: ({ context, event }) =>
                context.reports.map((report) =>
                  report.id === event.reportId
                    ? {
                        ...report,
                        status: 'resolved' as const,
                        resolvedBy: event.userId,
                        resolvedAt: new Date(),
                      }
                    : report,
                ),
            }),
            historyAction('report_resolved'),
          ],
        },
        HANDLE_CORRECTION: {
          actions: [
            assign({
              corrections: ({ context, event }) =>
                context.corrections.map((correction) =>
                  correction.id === event.correctionId
                    ? {
                        ...correction,
                        status: event.action,
                        handledBy: event.userId,
                        handledAt: new Date(),
                      }
                    : correction,
                ),
            }),
            historyAction('correction_handled'),
          ],
        },
      },
    },
    approved: { type: 'final' },
    rejected: { type: 'final' },
  },
  on: {
    SYNC_STATE: {
      actions: assign(({ context, event }) => ({
        ...context,
        wordData: { ...(context.wordData || {}), ...(event.context.wordData || {}) },
        communityVotes: {
          ...context.communityVotes,
          ...(event.context.communityVotes || {}),
        },
        reviewedBy: event.context.reviewedBy || context.reviewedBy,
        history: event.context.history || context.history,
      })),
    },
    UPDATE_WORD_DATA: {
      actions: assign({
        wordData: ({ context, event }) => ({
          ...(context.wordData || {}),
          ...event.data,
        }),
      }),
    },
  },
});

export default wordReviewMachine;
