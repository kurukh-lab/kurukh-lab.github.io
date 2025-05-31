/**
 * Comment Service
 * 
 * This service handles CRUD operations for threaded comments in the Community Review section.
 * Supports Reddit-style threaded comments with voting functionality.
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';

/**
 * Add a new comment to a word
 * @param {string} wordId - The ID of the word being commented on
 * @param {string} userId - The ID of the user making the comment
 * @param {string} content - The comment content
 * @param {string|null} parentCommentId - ID of parent comment for replies (null for top-level comments)
 * @returns {Promise<{success: boolean, commentId?: string, error?: string}>}
 */
export const addComment = async (wordId, userId, content, parentCommentId = null) => {
  try {
    if (!content.trim()) {
      return { success: false, error: 'Comment content cannot be empty' };
    }

    const commentData = {
      wordId,
      userId,
      content: content.trim(),
      parentCommentId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      upvotes: 0,
      downvotes: 0,
      upvotedBy: [],
      downvotedBy: [],
      replyCount: 0,
      isDeleted: false
    };

    const commentRef = await addDoc(collection(db, 'comments'), commentData);
    
    // If this is a reply, increment the parent comment's reply count
    if (parentCommentId) {
      const parentCommentRef = doc(db, 'comments', parentCommentId);
      await updateDoc(parentCommentRef, {
        replyCount: increment(1),
        updatedAt: serverTimestamp()
      });
    }

    return { success: true, commentId: commentRef.id };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get comments for a specific word with pagination
 * @param {string} wordId - The ID of the word
 * @param {number} limit - Maximum number of comments to fetch
 * @param {string|null} lastCommentId - ID of last comment for pagination
 * @returns {Promise<{success: boolean, comments?: Array, error?: string}>}
 */
export const getCommentsForWord = async (wordId, limit = 20, lastCommentId = null) => {
  try {
    let q = query(
      collection(db, 'comments'),
      where('wordId', '==', wordId),
      where('parentCommentId', '==', null), // Only get top-level comments
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const comments = [];

    for (const document of querySnapshot.docs) {
      const commentData = document.data();
      const comment = {
        id: document.id,
        ...commentData,
        createdAt: commentData.createdAt?.toDate(),
        updatedAt: commentData.updatedAt?.toDate()
      };

      // Get user info for this comment
      const userDoc = await getDoc(doc(db, 'users', commentData.userId));
      if (userDoc.exists()) {
        comment.userInfo = {
          displayName: userDoc.data().displayName || userDoc.data().email || 'Anonymous',
          email: userDoc.data().email
        };
      }

      // Get replies for this comment
      comment.replies = await getRepliesForComment(document.id);
      
      comments.push(comment);
    }

    return { success: true, comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get replies for a specific comment
 * @param {string} parentCommentId - The ID of the parent comment
 * @returns {Promise<Array>} Array of reply comments
 */
export const getRepliesForComment = async (parentCommentId) => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('parentCommentId', '==', parentCommentId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const replies = [];

    for (const document of querySnapshot.docs) {
      const commentData = document.data();
      const reply = {
        id: document.id,
        ...commentData,
        createdAt: commentData.createdAt?.toDate(),
        updatedAt: commentData.updatedAt?.toDate()
      };

      // Get user info for this reply
      const userDoc = await getDoc(doc(db, 'users', commentData.userId));
      if (userDoc.exists()) {
        reply.userInfo = {
          displayName: userDoc.data().displayName || userDoc.data().email || 'Anonymous',
          email: userDoc.data().email
        };
      }

      replies.push(reply);
    }

    return replies;
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
};

/**
 * Vote on a comment (upvote or downvote)
 * @param {string} commentId - The ID of the comment
 * @param {string} userId - The ID of the user voting
 * @param {string} voteType - 'upvote' or 'downvote'
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const voteOnComment = async (commentId, userId, voteType) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      return { success: false, error: 'Comment not found' };
    }

    const commentData = commentDoc.data();
    const upvotedBy = commentData.upvotedBy || [];
    const downvotedBy = commentData.downvotedBy || [];

    // Check if user has already voted
    const hasUpvoted = upvotedBy.includes(userId);
    const hasDownvoted = downvotedBy.includes(userId);

    let updateData = { updatedAt: serverTimestamp() };

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        // Remove upvote
        updateData.upvotes = increment(-1);
        updateData.upvotedBy = arrayRemove(userId);
      } else {
        // Add upvote
        updateData.upvotes = increment(1);
        updateData.upvotedBy = arrayUnion(userId);
        
        // Remove downvote if exists
        if (hasDownvoted) {
          updateData.downvotes = increment(-1);
          updateData.downvotedBy = arrayRemove(userId);
        }
      }
    } else if (voteType === 'downvote') {
      if (hasDownvoted) {
        // Remove downvote
        updateData.downvotes = increment(-1);
        updateData.downvotedBy = arrayRemove(userId);
      } else {
        // Add downvote
        updateData.downvotes = increment(1);
        updateData.downvotedBy = arrayUnion(userId);
        
        // Remove upvote if exists
        if (hasUpvoted) {
          updateData.upvotes = increment(-1);
          updateData.upvotedBy = arrayRemove(userId);
        }
      }
    }

    await updateDoc(commentRef, updateData);

    return { 
      success: true, 
      message: `Comment ${voteType} ${hasUpvoted && voteType === 'upvote' || hasDownvoted && voteType === 'downvote' ? 'removed' : 'added'} successfully` 
    };
  } catch (error) {
    console.error('Error voting on comment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Edit a comment
 * @param {string} commentId - The ID of the comment to edit
 * @param {string} userId - The ID of the user editing
 * @param {string} newContent - The new comment content
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const editComment = async (commentId, userId, newContent) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      return { success: false, error: 'Comment not found' };
    }

    const commentData = commentDoc.data();

    // Check if user owns this comment
    if (commentData.userId !== userId) {
      return { success: false, error: 'You can only edit your own comments' };
    }

    if (!newContent.trim()) {
      return { success: false, error: 'Comment content cannot be empty' };
    }

    await updateDoc(commentRef, {
      content: newContent.trim(),
      updatedAt: serverTimestamp(),
      isEdited: true
    });

    return { success: true, message: 'Comment updated successfully' };
  } catch (error) {
    console.error('Error editing comment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete a comment (soft delete)
 * @param {string} commentId - The ID of the comment to delete
 * @param {string} userId - The ID of the user deleting
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export const deleteComment = async (commentId, userId) => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);

    if (!commentDoc.exists()) {
      return { success: false, error: 'Comment not found' };
    }

    const commentData = commentDoc.data();

    // Check if user owns this comment (or is admin - could add admin check here)
    if (commentData.userId !== userId) {
      return { success: false, error: 'You can only delete your own comments' };
    }

    await updateDoc(commentRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      content: '[deleted]',
      updatedAt: serverTimestamp()
    });

    // If this comment has a parent, decrement the parent's reply count
    if (commentData.parentCommentId) {
      const parentCommentRef = doc(db, 'comments', commentData.parentCommentId);
      await updateDoc(parentCommentRef, {
        replyCount: increment(-1),
        updatedAt: serverTimestamp()
      });
    }

    return { success: true, message: 'Comment deleted successfully' };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Set up real-time listener for comments on a word
 * @param {string} wordId - The ID of the word
 * @param {function} callback - Callback function to handle comment updates
 * @returns {function} Unsubscribe function
 */
export const subscribeToWordComments = (wordId, callback) => {
  const q = query(
    collection(db, 'comments'),
    where('wordId', '==', wordId),
    where('parentCommentId', '==', null),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));
    
    callback(comments);
  }, (error) => {
    console.error('Error in comment subscription:', error);
  });
};
