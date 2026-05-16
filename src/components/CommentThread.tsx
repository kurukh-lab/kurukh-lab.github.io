import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  getCommentsForWord,
  addComment,
  subscribeToWordComments,
  reloadParentReplies,
} from '../services/commentService';
import { wordReviewService } from '../services/wordReviewService';
import Comment from './Comment';
import { MAX_COMMENT_LEVEL } from '../config/comments';
import type { Comment as CommentModel, Word } from '../types';

type SortOrder = 'newest' | 'oldest' | 'best';

export interface CommentThreadProps {
  wordId: string;
  word?: Pick<Word, 'commentsCount'> & Partial<Word>;
  isOpen: boolean;
  onToggle: () => void;
}

const CommentThread = ({ wordId, word, isOpen, onToggle }: CommentThreadProps) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [comments, setComments] = useState<CommentModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState<SortOrder>('newest');
  const [realTimeCommentCount, setRealTimeCommentCount] = useState(
    word?.commentsCount ?? 0,
  );

  useEffect(() => {
    if (word?.commentsCount !== undefined) {
      setRealTimeCommentCount(word.commentsCount);
    }
  }, [word?.commentsCount]);

  useEffect(() => {
    let wordStatusUnsubscribe: () => void = () => {};
    if (isOpen && wordId) {
      wordStatusUnsubscribe = wordReviewService.subscribeToWordStatus(
        wordId,
        ({ context }) => {
          const c = (context?.wordData as { commentsCount?: number } | undefined)?.commentsCount;
          if (c !== undefined) setRealTimeCommentCount(c);
        },
      );
    }
    return () => {
      wordStatusUnsubscribe();
    };
  }, [isOpen, wordId]);

  const loadComments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCommentsForWord(wordId);
      if (result.success) {
        setComments(result.comments || []);
      } else {
        setError(result.error ?? null);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError(t('comments.loadError') as string);
    } finally {
      setLoading(false);
    }
  }, [wordId, t]);

  useEffect(() => {
    if (isOpen && wordId) {
      loadComments();
      const unsubscribe = subscribeToWordComments(wordId, (updatedComments) => {
        setComments((prevComments) =>
          updatedComments.map((updatedComment) => {
            const existing = prevComments.find((c) => c.id === updatedComment.id);
            return { ...updatedComment, replies: existing?.replies || [] };
          }),
        );
      });
      return () => unsubscribe();
    }
  }, [wordId, isOpen, loadComments]);

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await addComment(wordId, currentUser.uid, newComment.trim());
      if (result.success) {
        setNewComment('');
      } else {
        setError(result.error ?? null);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError(t('comments.addError') as string);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = useCallback(
    async (parentCommentId: string, content: string) => {
      if (!currentUser) return;
      try {
        const result = await addComment(wordId, currentUser.uid, content, parentCommentId);
        if (result.success) {
          await loadComments();
        } else {
          setError(result.error ?? null);
        }
      } catch (err) {
        console.error('Error adding reply:', err);
        setError(t('comments.replyError') as string);
      }
    },
    [wordId, currentUser, t, loadComments],
  );

  const handleEdit = useCallback((commentId: string, newContent: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, content: newContent, isEdited: true };
        }
        if (comment.replies) {
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === commentId
              ? { ...reply, content: newContent, isEdited: true }
              : reply,
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      }),
    );
  }, []);

  const handleDelete = useCallback((commentId: string) => {
    setComments((prevComments) =>
      prevComments.map((comment) => {
        if (comment.id === commentId) {
          return { ...comment, isDeleted: true, content: '[deleted]' };
        }
        if (comment.replies) {
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === commentId
              ? { ...reply, isDeleted: true, content: '[deleted]' }
              : reply,
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      }),
    );
  }, []);

  const updateNestedReplies = (
    replies: CommentModel[],
    targetParentId: string,
    newReplies: CommentModel[],
  ): CommentModel[] =>
    replies.map((reply) => {
      if (reply.id === targetParentId) return { ...reply, replies: newReplies };
      if (reply.replies) {
        const updated = updateNestedReplies(reply.replies, targetParentId, newReplies);
        if (updated !== reply.replies) return { ...reply, replies: updated };
      }
      return reply;
    });

  const handleParentReload = useCallback(
    async (parentCommentId: string) => {
      try {
        const isTopLevel = comments.some((c) => c.id === parentCommentId);
        if (isTopLevel) {
          await loadComments();
        } else {
          const result = await reloadParentReplies(parentCommentId, 0, 10);
          if (result.success) {
            setComments((prevComments) =>
              prevComments.map((comment) => {
                if (comment.id === parentCommentId) {
                  return { ...comment, replies: result.replies || [] };
                }
                if (comment.replies) {
                  const updated = updateNestedReplies(
                    comment.replies,
                    parentCommentId,
                    result.replies || [],
                  );
                  if (updated !== comment.replies) {
                    return { ...comment, replies: updated };
                  }
                }
                return comment;
              }),
            );
          }
        }
      } catch (err) {
        console.error('Error reloading parent replies in CommentThread:', err);
      }
    },
    [comments, loadComments],
  );

  const handleVote = useCallback(() => {
    // Real-time updates will handle vote changes
  }, []);

  const sortComments = (list: CommentModel[], order: SortOrder): CommentModel[] => {
    const sorted = [...list];
    const toMs = (d: unknown): number => {
      if (!d) return 0;
      if (d instanceof Date) return d.getTime();
      return new Date(d as string).getTime();
    };
    switch (order) {
      case 'oldest':
        return sorted.sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt));
      case 'best':
        return sorted.sort(
          (a, b) =>
            ((b.upvotes || 0) - (b.downvotes || 0)) -
            ((a.upvotes || 0) - (a.downvotes || 0)),
        );
      case 'newest':
      default:
        return sorted.sort((a, b) => toMs(b.createdAt) - toMs(a.createdAt));
    }
  };

  const sortedComments = sortComments(comments, sortBy);
  const commentCount =
    realTimeCommentCount ??
    comments.reduce(
      (total, comment) => total + 1 + (comment.replies ? comment.replies.length : 0),
      0,
    );

  if (!isOpen) {
    return (
      <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--kd-line)' }}>
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 kd-font-sans transition-colors"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--kd-ink-soft)',
            padding: 0,
          }}
        >
          <CommentBubbleIcon />
          {t('comments.count', { count: commentCount })}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--kd-line)' }}>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex items-center gap-2 kd-font-sans"
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--kd-ink)',
            padding: 0,
          }}
        >
          <CommentBubbleIcon />
          {t('comments.count', { count: commentCount })}
        </button>

        {comments.length > 1 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOrder)}
            className="kd-font-sans outline-none appearance-none"
            style={{
              background: 'var(--kd-bg)',
              color: 'var(--kd-ink)',
              border: '1px solid var(--kd-line)',
              borderRadius: 10,
              padding: '6px 32px 6px 10px',
              fontSize: 12,
              backgroundImage: chevronBg(),
              backgroundPosition: 'right 10px center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <option value="newest">{t('comments.sort.newest')}</option>
            <option value="oldest">{t('comments.sort.oldest')}</option>
            <option value="best">{t('comments.sort.best')}</option>
          </select>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="kd-font-sans mb-4 px-4 py-3 rounded-xl"
          style={{
            background: 'var(--kd-accent-tint)',
            color: 'var(--kd-accent)',
            border: '1px solid color-mix(in srgb, var(--kd-accent) 40%, transparent)',
            fontSize: 13,
          }}
        >
          {error}
        </div>
      )}

      {currentUser ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('comments.placeholder') as string}
            rows={3}
            disabled={isSubmitting}
            className="kd-font-serif w-full outline-none"
            style={{
              background: 'var(--kd-bg)',
              color: 'var(--kd-ink)',
              border: '1px solid var(--kd-line)',
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: 15,
              lineHeight: 1.5,
              resize: 'vertical',
            }}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="kd-font-sans inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] text-[13.5px] font-semibold disabled:opacity-50"
              style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
            >
              {isSubmitting ? t('comments.posting') : t('comments.post')}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="kd-font-sans mb-6 px-4 py-3 rounded-xl"
          style={{
            background: 'var(--kd-surface-alt)',
            color: 'var(--kd-ink-soft)',
            border: '1px solid var(--kd-line)',
            fontSize: 13.5,
          }}
        >
          {t('comments.loginRequired')}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md" style={{ color: 'var(--kd-accent)' }} />
        </div>
      ) : comments.length === 0 ? (
        <div
          className="kd-font-serif italic text-center py-10"
          style={{ fontSize: 15, color: 'var(--kd-ink-mute)' }}
        >
          {t('comments.noComments')}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {sortedComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onVote={handleVote}
              onParentReload={handleParentReload}
              level={0}
              maxLevel={MAX_COMMENT_LEVEL}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CommentBubbleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
  </svg>
);

const chevronBg = (): string =>
  `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%238A8073' stroke-width='2' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>")`;

export default CommentThread;
