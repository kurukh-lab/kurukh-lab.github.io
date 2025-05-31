/**
 * Comment Component
 * 
 * Displays a single comment with voting, reply, edit, and delete functionality.
 * Supports nested threading for Reddit-style comment trees.
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { voteOnComment, editComment, deleteComment, loadRepliesForComment, reloadParentReplies } from '../services/commentService';
import { formatDate } from '../utils/wordUtils';

const Comment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  onVote,
  onParentReload,
  level = 0,
  maxLevel = 10
}) => {
  const { currentUser } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votingInProgress, setVotingInProgress] = useState(false);
  const [showReplies, setShowReplies] = useState(level < 3); // Auto-expand first 3 levels
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [repliesLoaded, setRepliesLoaded] = useState(comment.repliesLoaded || level < 3);
  const [dynamicReplies, setDynamicReplies] = useState(comment.replies || []);

  // Calculate net score
  const netScore = (comment.upvotes || 0) - (comment.downvotes || 0);

  // Check if current user has voted
  const hasUpvoted = comment.upvotedBy?.includes(currentUser?.uid);
  const hasDownvoted = comment.downvotedBy?.includes(currentUser?.uid);

  // Check if current user owns this comment
  const isOwner = currentUser?.uid === comment.userId;

  // Handle reloading this comment's replies when a child is edited/deleted
  const handleChildParentReload = async (parentCommentId) => {
    if (parentCommentId === comment.id) {
      // This comment is the parent that needs to be reloaded
      try {
        const result = await reloadParentReplies(comment.id, level, maxLevel);
        if (result.success) {
          // Always update dynamic replies for consistent behavior
          setDynamicReplies(result.replies || []);
          setRepliesLoaded(true);
          
          // For levels 0-2, we need to also update the comment's replies property
          // This will be handled by the parent component's reload mechanism
          if (level < 3 && onParentReload) {
            // Signal to parent to reload this comment's data
            onParentReload(comment.id);
          }
        }
      } catch (error) {
        console.error('Error reloading parent replies:', error);
      }
    } else if (onParentReload) {
      // Pass the reload request up the chain
      onParentReload(parentCommentId);
    }
  };

  // Handle loading replies dynamically for deep nested comments
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
    } catch (error) {
      console.error('Error loading replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handleVote = async (voteType) => {
    if (!currentUser) return;

    setVotingInProgress(true);
    try {
      const result = await voteOnComment(comment.id, currentUser.uid, voteType);
      if (result.success && onVote) {
        onVote(comment.id, voteType);
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    } finally {
      setVotingInProgress(false);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      if (onReply) {
        await onReply(comment.id, replyContent.trim());
        setReplyContent('');
        setShowReplyForm(false);
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || !currentUser) return;

    setIsSubmitting(true);
    try {
      const result = await editComment(comment.id, currentUser.uid, editContent.trim());
      if (result.success) {
        if (onEdit) {
          onEdit(comment.id, editContent.trim());
        }
        // If this comment has a parent and we have a parent reload handler, reload just the parent
        if (result.parentCommentId && onParentReload) {
          onParentReload(result.parentCommentId);
        }
        setShowEditForm(false);
      }
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUser || !window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      const result = await deleteComment(comment.id, currentUser.uid);
      if (result.success) {
        if (onDelete) {
          onDelete(comment.id);
        }
        // If this comment has a parent and we have a parent reload handler, reload just the parent
        if (result.parentCommentId && onParentReload) {
          onParentReload(result.parentCommentId);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  // Calculate indentation based on nesting level (using proper Tailwind classes)
  const getIndentClass = (level) => {
    if (level === 0) return '';
    // Use standard Tailwind margin classes, max out at reasonable level
    const indentMap = {
      1: 'ml-4',   // 1rem
      2: 'ml-8',   // 2rem  
      3: 'ml-12',  // 3rem
      4: 'ml-16',  // 4rem
      5: 'ml-20',  // 5rem
      6: 'ml-24',  // 6rem
      7: 'ml-28',  // 7rem
      8: 'ml-32',  // 8rem
      9: 'ml-36',  // 9rem
      10: 'ml-40'  // 10rem - max visual indent
    };
    return indentMap[Math.min(level, 10)] || 'ml-40';
  };
  
  const indentClass = getIndentClass(level);

  // Comments can nest up to maxLevel
  const isCollapsed = level > maxLevel;

  if (comment.isDeleted) {
    return (
      <div className={`comment-deleted ${indentClass} py-2`}>
        <div className="text-gray-500 italic text-sm">[deleted]</div>
      </div>
    );
  }

  return (
    <div className={`comment ${indentClass} ${level > 0 ? 'border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      {/* Comment Header */}
      <div className="flex items-start space-x-3">
        {/* Voting Section */}
        <div className="flex flex-col items-center space-y-1 min-w-[40px]">
          <button
            onClick={() => handleVote('upvote')}
            disabled={votingInProgress || !currentUser}
            className={`btn btn-xs btn-ghost p-1 ${hasUpvoted ? 'text-orange-500' : 'text-gray-400 hover:text-orange-500'}`}
            title="Upvote"
          >
            {votingInProgress ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <span className={`text-sm font-medium ${netScore > 0 ? 'text-orange-500' : netScore < 0 ? 'text-blue-500' : 'text-gray-500'}`}>
            {netScore}
          </span>

          <button
            onClick={() => handleVote('downvote')}
            disabled={votingInProgress || !currentUser}
            className={`btn btn-xs btn-ghost p-1 ${hasDownvoted ? 'text-blue-500' : 'text-gray-400 hover:text-blue-500'}`}
            title="Downvote"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Comment Content */}
        <div className="flex-1 min-w-0">
          {/* Comment Meta */}
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <span className="font-medium text-gray-700">
              {comment.userInfo?.displayName || 'Anonymous'}
            </span>
            <span>•</span>
            <span>{formatDate(comment.createdAt)}</span>
            {comment.isEdited && (
              <>
                <span>•</span>
                <span className="text-xs">(edited)</span>
              </>
            )}
          </div>

          {/* Comment Body */}
          {showEditForm ? (
            <form onSubmit={handleEditSubmit} className="mb-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea textarea-bordered w-full text-sm"
                rows="3"
                placeholder="Edit your comment..."
                disabled={isSubmitting}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting || !editContent.trim()}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Save'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditContent(comment.content);
                  }}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="prose prose-sm max-w-none mb-3">
              <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            </div>
          )}

          {/* Comment Actions */}
          {!showEditForm && (
            <div className="flex items-center space-x-4 text-sm">
              {currentUser && level < maxLevel && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                >
                  Reply
                </button>
              )}

              {isOwner && (
                <>
                  <button
                    onClick={() => setShowEditForm(true)}
                    className="text-gray-500 hover:text-gray-700 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-red-500 hover:text-red-700 font-medium"
                  >
                    Delete
                  </button>
                </>
              )}

              {/* Show replies toggle if there are replies */}
              {((comment.replies && comment.replies.length > 0) || (level >= 3 && comment.hasReplies)) && (
                <button
                  onClick={() => {
                    if (level >= 3 && !repliesLoaded) {
                      handleLoadReplies();
                    } else {
                      setShowReplies(!showReplies);
                    }
                  }}
                  className="text-gray-500 hover:text-gray-700 font-medium"
                  disabled={loadingReplies}
                >
                  {loadingReplies ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-1"></span>
                      Loading...
                    </>
                  ) : level >= 3 && !repliesLoaded ? (
                    `Load ${comment.replyCount || 0} ${(comment.replyCount || 0) === 1 ? 'reply' : 'replies'}`
                  ) : (
                    `${showReplies ? 'Hide' : 'Show'} ${(comment.replies?.length || dynamicReplies.length)} ${((comment.replies?.length || dynamicReplies.length) === 1) ? 'reply' : 'replies'}`
                  )}
                </button>
              )}
            </div>
          )}

          {/* Reply Form */}
          {showReplyForm && (
            <form onSubmit={handleReplySubmit} className="mt-3 p-3 bg-gray-50 rounded-lg">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                className="textarea textarea-bordered w-full text-sm"
                rows="3"
                placeholder="Write a reply..."
                disabled={isSubmitting}
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isSubmitting || !replyContent.trim()}
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Reply'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                  className="btn btn-ghost btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Replies */}
      {showReplies && (
        <div className="mt-4">
          {/* Render static replies (for levels 0-2) or dynamically loaded replies (for levels 3+) */}
          {(level < 3 ? (comment.replies || []) : dynamicReplies).map((reply) => (
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

export default Comment;
