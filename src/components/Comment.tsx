import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import {
  voteOnComment,
  editComment,
  deleteComment,
  loadRepliesForComment,
  reloadParentReplies,
  type CommentVoteType,
} from '../services/commentService';
import { formatDate } from '../utils/wordUtils';
import { MAX_COMMENT_LEVEL } from '../config/comments';
import type { Comment as CommentModel } from '../types';

const initialsOf = (name: string): string =>
  (name || '?')
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export interface CommentProps {
  comment: CommentModel;
  onReply?: (parentCommentId: string, content: string) => void | Promise<void>;
  onEdit?: (commentId: string, newContent: string) => void;
  onDelete?: (commentId: string) => void;
  onVote?: (commentId: string, voteType: CommentVoteType) => void;
  onParentReload?: (parentCommentId: string) => void | Promise<void>;
  level?: number;
  maxLevel?: number;
}

const Comment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onVote,
  onParentReload,
  level = 0,
  maxLevel = MAX_COMMENT_LEVEL,
}: CommentProps) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 3);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(
    comment.repliesLoaded || level < 3,
  );
  const [dynamicReplies, setDynamicReplies] = useState<CommentModel[]>(
    comment.replies || [],
  );

  const netScore = (comment.upvotes || 0) - (comment.downvotes || 0);
  const hasUpvoted = !!currentUser && comment.upvotedBy?.includes(currentUser.uid);
  const hasDownvoted = !!currentUser && comment.downvotedBy?.includes(currentUser.uid);
  const isOwner = currentUser?.uid === comment.userId;
  const displayName = comment.userInfo?.displayName || t('comments.anonymous');
  const avatarBg = level % 2 === 0 ? 'var(--kd-accent-soft)' : 'var(--kd-sage-soft)';

  const handleChildParentReload = async (parentCommentId: string) => {
    if (parentCommentId === comment.id) {
      try {
        const result = await reloadParentReplies(comment.id, level, maxLevel);
        if (result.success) {
          setDynamicReplies(result.replies || []);
          setRepliesLoaded(true);
          if (level < 3 && onParentReload) onParentReload(comment.id);
        }
      } catch (err) {
        console.error('Error reloading parent replies:', err);
      }
    } else if (onParentReload) {
      onParentReload(parentCommentId);
    }
  };

  const handleLoadReplies = async () => {
    if (loadingReplies || repliesLoaded) return;
    setLoadingReplies(true);
    try {
      const result = await loadRepliesForComment(comment.id, level, maxLevel);
      if (result.success) {
        setDynamicReplies(result.replies || []);
        setRepliesLoaded(true);
        setShowReplies(true);
      }
    } catch (err) {
      console.error('Error loading replies:', err);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleVote = async (voteType: CommentVoteType) => {
    if (!currentUser) return;
    setVotingInProgress(true);
    try {
      const result = await voteOnComment(comment.id, currentUser.uid, voteType);
      if (result.success && onVote) onVote(comment.id, voteType);
    } catch (err) {
      console.error('Error voting on comment:', err);
    } finally {
      setVotingInProgress(false);
    }
  };

  const handleReplySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      if (onReply) {
        await onReply(comment.id, replyContent.trim());
        setReplyContent('');
        setShowReplyForm(false);
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editContent.trim() || !currentUser) return;
    setIsSubmitting(true);
    try {
      const result = await editComment(comment.id, currentUser.uid, editContent.trim());
      if (result.success) {
        if (onEdit) onEdit(comment.id, editContent.trim());
        if (result.parentCommentId && onParentReload) onParentReload(result.parentCommentId);
        setShowEditForm(false);
      }
    } catch (err) {
      console.error('Error editing comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !window.confirm(t('comments.deleteConfirm') as string)) return;
    try {
      const result = await deleteComment(comment.id, currentUser.uid);
      if (result.success) {
        if (onDelete) onDelete(comment.id);
        if (result.parentCommentId && onParentReload) onParentReload(result.parentCommentId);
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  if (comment.isDeleted) {
    return (
      <div
        className="kd-font-serif italic py-2"
        style={{
          fontSize: 14,
          color: 'var(--kd-ink-mute)',
          paddingLeft: level > 0 ? 16 : 0,
          borderLeft: level > 0 ? '2px solid var(--kd-line)' : 'none',
        }}
      >
        {t('comments.deleted')}
      </div>
    );
  }

  const indent = level === 0 ? 0 : Math.min(level, 6) * 18;

  const inputStyle = {
    background: 'var(--kd-bg)',
    color: 'var(--kd-ink)',
    border: '1px solid var(--kd-line)',
    borderRadius: 10,
    padding: '10px 12px',
    fontSize: 14,
    lineHeight: 1.5,
    outline: 'none',
    resize: 'vertical' as const,
  };

  return (
    <div
      style={{
        marginLeft: indent,
        paddingLeft: level > 0 ? 16 : 0,
        borderLeft: level > 0 ? '2px solid var(--kd-line)' : 'none',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-1" style={{ minWidth: 30 }}>
          <button
            type="button"
            onClick={() => handleVote('upvote')}
            disabled={votingInProgress || !currentUser}
            title="Upvote"
            aria-pressed={hasUpvoted || undefined}
            className="inline-flex items-center justify-center transition-colors disabled:opacity-50"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: 'none',
              background: hasUpvoted ? 'var(--kd-accent-tint)' : 'transparent',
              color: hasUpvoted ? 'var(--kd-accent)' : 'var(--kd-ink-mute)',
              cursor: votingInProgress || !currentUser ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevUp />
          </button>
          <span
            className="kd-font-mono"
            style={{
              fontSize: 13,
              fontWeight: 600,
              color:
                netScore > 0
                  ? 'var(--kd-accent)'
                  : netScore < 0
                    ? 'var(--kd-sage)'
                    : 'var(--kd-ink-mute)',
            }}
          >
            {netScore}
          </span>
          <button
            type="button"
            onClick={() => handleVote('downvote')}
            disabled={votingInProgress || !currentUser}
            title="Downvote"
            aria-pressed={hasDownvoted || undefined}
            className="inline-flex items-center justify-center transition-colors disabled:opacity-50"
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              border: 'none',
              background: hasDownvoted
                ? 'color-mix(in srgb, var(--kd-sage) 18%, transparent)'
                : 'transparent',
              color: hasDownvoted ? 'var(--kd-sage)' : 'var(--kd-ink-mute)',
              cursor: votingInProgress || !currentUser ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevDown />
          </button>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="kd-font-serif inline-flex items-center justify-center"
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: avatarBg,
                color: '#FFF',
                fontWeight: 600,
                fontSize: 10,
              }}
            >
              {initialsOf(String(displayName))}
            </span>
            <span
              className="kd-font-sans"
              style={{ fontSize: 13, fontWeight: 500, color: 'var(--kd-ink)' }}
            >
              {displayName}
            </span>
            <span style={{ color: 'var(--kd-ink-mute)' }}>·</span>
            <span className="kd-font-sans" style={{ fontSize: 12, color: 'var(--kd-ink-mute)' }}>
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <>
                <span style={{ color: 'var(--kd-ink-mute)' }}>·</span>
                <span
                  className="kd-font-mono"
                  style={{ fontSize: 11, color: 'var(--kd-ink-mute)', letterSpacing: '0.06em' }}
                >
                  {t('comments.edited')}
                </span>
              </>
            )}
          </div>

          {showEditForm ? (
            <form onSubmit={handleEditSubmit} className="mt-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                className="kd-font-serif w-full"
                style={inputStyle}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !editContent.trim()}
                  className="kd-font-sans px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold disabled:opacity-50"
                  style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
                >
                  {t('comments.save')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isSubmitting}
                  className="kd-font-sans px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium"
                  style={{
                    background: 'transparent',
                    color: 'var(--kd-ink-soft)',
                    border: '1px solid var(--kd-line)',
                  }}
                >
                  {t('comments.cancel')}
                </button>
              </div>
            </form>
          ) : (
            <p
              className="kd-font-serif mt-2 mb-2 whitespace-pre-wrap"
              style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--kd-ink)', margin: '8px 0' }}
            >
              {comment.content}
            </p>
          )}

          {!showEditForm && (
            <div
              className="flex items-center gap-4 kd-font-sans"
              style={{ fontSize: 12.5, color: 'var(--kd-ink-soft)' }}
            >
              {currentUser && level < maxLevel && (
                <button
                  type="button"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="font-medium transition-colors hover:opacity-80"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    padding: 0,
                  }}
                >
                  {t('comments.reply')}
                </button>
              )}
              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => setShowEditForm(true)}
                    className="font-medium transition-colors hover:opacity-80"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'inherit',
                      padding: 0,
                    }}
                  >
                    {t('comments.edit')}
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="font-medium transition-colors hover:opacity-80"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--kd-accent)',
                      padding: 0,
                    }}
                  >
                    {t('comments.delete')}
                  </button>
                </>
              )}
              {((comment.replies && comment.replies.length > 0) ||
                (level >= 3 && comment.hasReplies)) && (
                <button
                  type="button"
                  onClick={() => {
                    if (level >= 3 && !repliesLoaded) handleLoadReplies();
                    else setShowReplies(!showReplies);
                  }}
                  disabled={loadingReplies}
                  className="font-medium transition-colors hover:opacity-80"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'inherit',
                    padding: 0,
                  }}
                >
                  {loadingReplies
                    ? t('comments.loading')
                    : level >= 3 && !repliesLoaded
                      ? t('comments.loadReplies', { count: comment.replyCount || 0 })
                      : showReplies
                        ? t('comments.hideReplies', {
                            count: comment.replies?.length || dynamicReplies.length,
                          })
                        : t('comments.showReplies', {
                            count: comment.replies?.length || dynamicReplies.length,
                          })}
                </button>
              )}
            </div>
          )}

          {showReplyForm && (
            <form
              onSubmit={handleReplySubmit}
              className="mt-3 p-3 rounded-xl"
              style={{ background: 'var(--kd-surface-alt)', border: '1px solid var(--kd-line)' }}
            >
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={3}
                placeholder={t('comments.replyPlaceholder') as string}
                disabled={isSubmitting}
                className="kd-font-serif w-full"
                style={inputStyle}
              />
              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !replyContent.trim()}
                  className="kd-font-sans px-3 py-1.5 rounded-[8px] text-[12.5px] font-semibold disabled:opacity-50"
                  style={{ background: 'var(--kd-ink)', color: 'var(--kd-bg)' }}
                >
                  {t('comments.replyAction')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  disabled={isSubmitting}
                  className="kd-font-sans px-3 py-1.5 rounded-[8px] text-[12.5px] font-medium"
                  style={{
                    background: 'transparent',
                    color: 'var(--kd-ink-soft)',
                    border: '1px solid var(--kd-line)',
                  }}
                >
                  {t('comments.cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {showReplies && (
        <div className="mt-4 flex flex-col gap-4">
          {(level < 3 ? comment.replies || [] : dynamicReplies).map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onVote={onVote}
              onParentReload={handleChildParentReload}
              level={level + 1}
              maxLevel={maxLevel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ChevUp = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 15 6-6 6 6" />
  </svg>
);
const ChevDown = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default Comment;
