/**
 * CommentThread Component
 * 
 * Manages the threaded comment system for word reviews.
 * Provides functionality to add top-level comments and handles real-time updates.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getCommentsForWord,
  addComment,
  subscribeToWordComments,
  reloadParentReplies
} from '../services/commentService';
import Comment from './Comment';

const CommentThread = ({ wordId, word, isOpen, onToggle }) => {
  const { currentUser } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'best'

  // Load comments when component mounts or wordId changes
  useEffect(() => {
    if (isOpen && wordId) {
      loadComments();

      // Set up real-time listener
      const unsubscribe = subscribeToWordComments(wordId, (updatedComments) => {
        // Merge with existing replies data since real-time listener only gets top-level comments
        setComments(prevComments => {
          const mergedComments = updatedComments.map(updatedComment => {
            const existingComment = prevComments.find(c => c.id === updatedComment.id);
            return {
              ...updatedComment,
              replies: existingComment?.replies || []
            };
          });
          return mergedComments;
        });
      });

      return () => unsubscribe();
    }
  }, [wordId, isOpen]);

  const loadComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getCommentsForWord(wordId);
      if (result.success) {
        setComments(result.comments || []);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading comments:', err);
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addComment(wordId, currentUser.uid, newComment.trim());
      if (result.success) {
        setNewComment('');
        // Comments will be updated via real-time listener
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = useCallback(async (parentCommentId, content) => {
    if (!currentUser) return;

    try {
      const result = await addComment(wordId, currentUser.uid, content, parentCommentId);
      if (result.success) {
        // Reload comments to get updated nested reply structure
        await loadComments();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error adding reply:', err);
      setError('Failed to add reply');
    }
  }, [wordId, currentUser]);

  const handleEdit = useCallback((commentId, newContent) => {
    // Update comment in local state
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, content: newContent, isEdited: true };
        }
        // Check replies too
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply =>
            reply.id === commentId
              ? { ...reply, content: newContent, isEdited: true }
              : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    );
  }, []);

  const handleDelete = useCallback((commentId) => {
    // Update comment in local state
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return { ...comment, isDeleted: true, content: '[deleted]' };
        }
        // Check replies too
        if (comment.replies) {
          const updatedReplies = comment.replies.map(reply =>
            reply.id === commentId
              ? { ...reply, isDeleted: true, content: '[deleted]' }
              : reply
          );
          return { ...comment, replies: updatedReplies };
        }
        return comment;
      })
    );
  }, []);

  const handleParentReload = useCallback(async (parentCommentId) => {
    try {
      // Find if this is a top-level comment
      const isTopLevel = comments.some(c => c.id === parentCommentId);
      
      if (isTopLevel) {
        // If it's a top-level comment, reload all comments to get the updated structure
        await loadComments();
      } else {
        // Find the parent comment and reload its replies
        const result = await reloadParentReplies(parentCommentId, 0, 10);
        if (result.success) {
          setComments(prevComments =>
            prevComments.map((comment) => {
              if (comment.id === parentCommentId) {
                return { ...comment, replies: result.replies || [] };
              }
              // Also check nested replies for deep comments
              if (comment.replies) {
                const updatedReplies = updateNestedReplies(comment.replies, parentCommentId, result.replies || []);
                if (updatedReplies !== comment.replies) {
                  return { ...comment, replies: updatedReplies };
                }
              }
              return comment;
            })
          );
        }
      }
    } catch (error) {
      console.error('Error reloading parent replies in CommentThread:', error);
    }
  }, [comments]);

  // Helper function to update nested replies recursively
  const updateNestedReplies = (replies, targetParentId, newReplies) => {
    return replies.map(reply => {
      if (reply.id === targetParentId) {
        return { ...reply, replies: newReplies };
      }
      if (reply.replies) {
        const updatedNestedReplies = updateNestedReplies(reply.replies, targetParentId, newReplies);
        if (updatedNestedReplies !== reply.replies) {
          return { ...reply, replies: updatedNestedReplies };
        }
      }
      return reply;
    });
  };

  const handleVote = useCallback((commentId, voteType) => {
    // Real-time updates will handle vote changes
    // This is a placeholder for immediate UI feedback if needed
  }, []);

  const sortComments = (comments, sortBy) => {
    const sorted = [...comments];
    switch (sortBy) {
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'best':
        return sorted.sort((a, b) => {
          const scoreA = (a.upvotes || 0) - (a.downvotes || 0);
          const scoreB = (b.upvotes || 0) - (b.downvotes || 0);
          return scoreB - scoreA;
        });
      case 'newest':
      default:
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  };

  const sortedComments = sortComments(comments, sortBy);
  // Use static comment count from word model for better performance
  // Falls back to dynamic calculation if static count is not available
  const commentCount = word?.commentsCount ?? comments.reduce((total, comment) => {
    return total + 1 + (comment.replies ? comment.replies.length : 0);
  }, 0);

  if (!isOpen) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={onToggle}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.998L3 21l1.998-5.874A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
          </svg>
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onToggle}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.998L3 21l1.998-5.874A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
            </svg>
            <span className="font-medium">{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
          </button>
        </div>

        {/* Sort Options */}
        {comments.length > 1 && (
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="select select-bordered select-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="best">Best</option>
          </select>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error mb-4">
          <span>{error}</span>
        </div>
      )}

      {/* Add Comment Form */}
      {currentUser ? (
        <form onSubmit={handleAddComment} className="mb-6">
          <div className="form-control">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows="3"
              placeholder="Add a comment..."
              disabled={isSubmitting}
            />
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Posting...
                </>
              ) : (
                'Post Comment'
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="alert alert-info mb-6">
          <span>Please log in to join the discussion.</span>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-md"></span>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.998L3 21l1.998-5.874A8.955 8.955 0 013 12a8 8 0 018-8c4.418 0 8 3.582 8 8z" />
          </svg>
          <p>No comments yet. Be the first to start the discussion!</p>
        </div>
      ) : (
        <div className="space-y-6">
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
              maxLevel={10}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentThread;
