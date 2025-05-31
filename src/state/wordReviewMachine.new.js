import { createMachine, assign } from 'xstate';

/**
 * XState machine for word review process
 * 
 * This machine manages the different states a word can be in:
 * 1. New submission (draft or submitted)
 * 2. Pending review (awaiting admin or community review)
 * 3. In community review (being reviewed by community members)
 * 4. Admin review (final review by administrators)
 * 5. Final states (approved, rejected)
 */

export const wordReviewMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOlwgBswBiAZQFUAVAQQBEB9AMQGEARANoAGALqJQAB1KwW7MBA7MAJgGYAdgBsADj0BOAMwBWABwAWPQA59Bo0YA0IAJ6JTxnSaNmD+k0Z0GAvr7WaFi4BCRklLQMTKwcPPyCIuJSCLJKKupIINq6SIYODiYOnl4+foHo2PjEZBRUtAzMhCxsHNy8AnJCYpLSCAqKSGpaCOoGtvpGJs1tjl09bgGhEVi4BKQJSXRpGQj0OQXSRWIlpeWVyDV1x428BkZ67RbWDqOjYxPTswtzK1s7RxcHW6kQGd0ejxe7zgXx+f3owOBoMhsXSECy2VyhVu6jsEEceQKRRKZQqNhcbncni8GK8vzG-2BILBFDISWS6UymVAaIueJouPxxLx8KJJPJWOp1QZ1Mo9KZLM53J5fP5oAwoFK+XKlQFQtF4olUrlFRBshUVTVjiJoxxSDxyr+JMp1N+9MZ8OBHK5QsyEFqEFqVylejKZAqGKQGPdYxGRLG-v9WtJOwpOzpDJu5ZZFdZ1aud3uBSeusN8GNvNNFstNetvPtjsdw2daA96C9BujBJj-oTtNT9Mz2ZzZcLHTLnUrQsrIurIdrYLrXsbLf9ABlfUH0xks5yOR7vZCfb6qP7hhQQWCIVDgs5h517J0nt0SpXeyW+9XB3WarVR3a7Q7Rz2KcOx3DcdxAA */
  id: 'wordReview',
  
  // Schema for XState v5
  schema: {
    context: {},
    events: {}
  },
  
  // Initial context is now provided from the input in XState v5
  context: ({ input }) => {
    return {
      wordId: input?.wordId || null,
      wordData: input?.wordData || null,
      corrections: [],
      reports: [],
      communityVotes: {
        for: 0,
        against: 0,
      },
      reviewedBy: [],
      history: [],
    };
  },
  
  initial: 'draft',
  
  states: {
    // Initial creation - word is being drafted
    draft: {
      on: {
        SUBMIT: {
          target: 'submitted',
          actions: 'logSubmission',
        }
      }
    },
    
    // Word has been submitted but not yet in review
    submitted: {
      on: {
        // Traditional flow - admin directly reviews
        SEND_TO_ADMIN_REVIEW: {
          target: 'pendingAdminReview',
          actions: 'logSentToAdminReview',
        },
        // Community review flow
        SEND_TO_COMMUNITY_REVIEW: {
          target: 'pendingCommunityReview',
          actions: 'logSentToCommunityReview',
        }
      }
    },

    // Pending community review - word is waiting for community members to review
    pendingCommunityReview: {
      on: {
        START_COMMUNITY_REVIEW: {
          target: 'inCommunityReview',
          actions: 'logCommunityReviewStarted',
        }
      }
    },
    
    // Active community review - community members are voting
    inCommunityReview: {
      on: {
        COMMUNITY_APPROVE: {
          actions: ['registerCommunityApproval', 'logCommunityVote'],
        },
        COMMUNITY_REJECT: {
          actions: ['registerCommunityRejection', 'logCommunityVote'],
        },
        // After enough votes or time passed, word can be promoted or rejected
        COMMUNITY_APPROVED: {
          target: 'communityApproved',
          actions: 'logCommunityApproved',
        },
        COMMUNITY_REJECTED: {
          target: 'communityRejected',
          actions: 'logCommunityRejected',
        },
        // Admin can intervene if necessary
        ADMIN_OVERRIDE: {
          target: 'pendingAdminReview',
          actions: 'logAdminOverride',
        },
        // Word can be reported during review
        REPORT_SUBMITTED: {
          actions: ['addReport', 'logReportSubmitted'],
        },
        // Word can receive corrections during review
        CORRECTION_SUBMITTED: {
          actions: ['addCorrection', 'logCorrectionSubmitted'],
        }
      }
    },
    
    // Word approved by community, now needs final admin review
    communityApproved: {
      on: {
        SEND_TO_ADMIN_REVIEW: {
          target: 'pendingAdminReview',
          actions: 'logSentToAdminReview',
        }
      }
    },

    // Word rejected by community
    communityRejected: {
      type: 'final',
      output: (context) => ({
        ...context,
        finalStatus: 'rejected',
        rejectedBy: 'community'
      })
    },
    
    // Word is awaiting admin review
    pendingAdminReview: {
      on: {
        START_ADMIN_REVIEW: {
          target: 'inAdminReview',
          actions: 'logAdminReviewStarted',
        }
      }
    },
    
    // Word is being reviewed by admin
    inAdminReview: {
      on: {
        ADMIN_APPROVE: {
          target: 'approved',
          actions: 'logAdminApproved',
        },
        ADMIN_REJECT: {
          target: 'rejected',
          actions: 'logAdminRejected',
        },
        // Send back for more community input if needed
        SEND_BACK_TO_COMMUNITY: {
          target: 'pendingCommunityReview',
          actions: 'logSentBackToCommunity',
        },
        // Admin can handle reports and corrections during review
        RESOLVE_REPORT: {
          actions: ['resolveReport', 'logReportResolved'],
        },
        HANDLE_CORRECTION: {
          actions: ['handleCorrection', 'logCorrectionHandled'],
        }
      }
    },
    
    // Word has been approved
    approved: {
      type: 'final',
      output: (context) => ({
        ...context,
        finalStatus: 'approved',
        approvedBy: 'admin'
      })
    },
    
    // Word has been rejected
    rejected: {
      type: 'final',
      output: (context) => ({
        ...context,
        finalStatus: 'rejected',
        rejectedBy: 'admin'
      })
    }
  },
  
  on: {
    // Global event handler to sync with Firestore data
    SYNC_STATE: {
      actions: [
        'syncStateFromFirestore',
        (context, event) => {
          console.log('Syncing state from Firestore:', event.state);
        }
      ],
    },
    // Global event handler to update word data
    UPDATE_WORD_DATA: {
      actions: assign({
        wordData: (context, event) => ({
          ...context.wordData,
          ...event.data
        })
      })
    }
  },
  
  actions: {
    // Word submission action
    logSubmission: assign({
      history: (context) => [...context.history, {
        action: 'submitted',
        timestamp: new Date()
      }]
    }),
    
    // Review process actions
    logSentToAdminReview: assign({
      history: (context) => [...context.history, {
        action: 'sent_to_admin_review',
        timestamp: new Date()
      }]
    }),
    
    logSentToCommunityReview: assign({
      history: (context) => [...context.history, {
        action: 'sent_to_community_review',
        timestamp: new Date()
      }]
    }),
    
    logCommunityReviewStarted: assign({
      history: (context) => [...context.history, {
        action: 'community_review_started',
        timestamp: new Date()
      }]
    }),
    
    logAdminReviewStarted: assign({
      history: (context) => [...context.history, {
        action: 'admin_review_started',
        timestamp: new Date()
      }]
    }),
    
    // Community voting actions
    registerCommunityApproval: assign({
      communityVotes: (context, event) => ({
        ...context.communityVotes,
        for: context.communityVotes.for + 1
      }),
      reviewedBy: (context, event) => [
        ...context.reviewedBy, 
        {
          userId: event.userId,
          vote: 'approve',
          timestamp: new Date()
        }
      ]
    }),
    
    registerCommunityRejection: assign({
      communityVotes: (context, event) => ({
        ...context.communityVotes,
        against: context.communityVotes.against + 1
      }),
      reviewedBy: (context, event) => [
        ...context.reviewedBy, 
        {
          userId: event.userId,
          vote: 'reject',
          timestamp: new Date()
        }
      ]
    }),
    
    logCommunityVote: assign({
      history: (context, event) => [...context.history, {
        action: `community_${event.type === 'COMMUNITY_APPROVE' ? 'approve' : 'reject'}`,
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    logCommunityApproved: assign({
      history: (context) => [...context.history, {
        action: 'community_approved',
        timestamp: new Date()
      }]
    }),
    
    logCommunityRejected: assign({
      history: (context) => [...context.history, {
        action: 'community_rejected',
        timestamp: new Date()
      }]
    }),
    
    logAdminApproved: assign({
      history: (context, event) => [...context.history, {
        action: 'admin_approved',
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    logAdminRejected: assign({
      history: (context, event) => [...context.history, {
        action: 'admin_rejected',
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    logAdminOverride: assign({
      history: (context, event) => [...context.history, {
        action: 'admin_override',
        userId: event.userId,
        reason: event.reason,
        timestamp: new Date()
      }]
    }),
    
    logSentBackToCommunity: assign({
      history: (context, event) => [...context.history, {
        action: 'sent_back_to_community',
        userId: event.userId,
        reason: event.reason,
        timestamp: new Date()
      }]
    }),
    
    // Report handling actions
    addReport: assign({
      reports: (context, event) => [...context.reports, {
        id: event.reportId,
        userId: event.userId,
        reason: event.reason,
        details: event.details,
        createdAt: new Date(),
        status: 'open'
      }]
    }),
    
    logReportSubmitted: assign({
      history: (context, event) => [...context.history, {
        action: 'report_submitted',
        reportId: event.reportId,
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    resolveReport: assign({
      reports: (context, event) => context.reports.map(report => 
        report.id === event.reportId ? 
        {
          ...report,
          status: 'resolved',
          resolvedBy: event.userId,
          resolvedAt: new Date()
        } : 
        report
      )
    }),
    
    logReportResolved: assign({
      history: (context, event) => [...context.history, {
        action: 'report_resolved',
        reportId: event.reportId,
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    // Correction handling actions
    addCorrection: assign({
      corrections: (context, event) => [...context.corrections, {
        id: event.correctionId,
        userId: event.userId,
        correctionType: event.correctionType,
        currentValue: event.currentValue,
        proposedChange: event.proposedChange,
        explanation: event.explanation,
        createdAt: new Date(),
        status: 'pending'
      }]
    }),
    
    logCorrectionSubmitted: assign({
      history: (context, event) => [...context.history, {
        action: 'correction_submitted',
        correctionId: event.correctionId,
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    handleCorrection: assign({
      corrections: (context, event) => context.corrections.map(correction => 
        correction.id === event.correctionId ? 
        {
          ...correction,
          status: event.action, // 'approved', 'rejected'
          handledBy: event.userId,
          handledAt: new Date()
        } : 
        correction
      )
    }),
    
    logCorrectionHandled: assign({
      history: (context, event) => [...context.history, {
        action: `correction_${event.action}`,
        correctionId: event.correctionId,
        userId: event.userId,
        timestamp: new Date()
      }]
    }),
    
    // Sync state from Firestore
    syncStateFromFirestore: assign((context, event) => {
      return {
        ...context,
        ...event.context,
        // Make sure we preserve any local overrides by merging carefully
        wordData: {
          ...(context.wordData || {}),
          ...(event.context.wordData || {}),
        },
        communityVotes: {
          ...(context.communityVotes || { for: 0, against: 0 }),
          ...(event.context.communityVotes || { for: 0, against: 0 }),
        },
        reviewedBy: event.context.reviewedBy || context.reviewedBy || [],
        history: event.context.history || context.history || [],
      };
    })
  }
});

export default wordReviewMachine;
