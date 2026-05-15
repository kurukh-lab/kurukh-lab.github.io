/**
 * Comment Service — CRUD + voting for threaded comments under the
 * Community Review surface.
 *
 * NOTE: ownership/role checks are enforced server-side by firestore.rules
 * (`isAuthorEdit`, `isAuthorSoftDelete`, `isCommentVote`); the client checks
 * here are UX-level and bypassable. Do not rely on them for security.
 */

import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Comment, ServiceResult } from '../types';

export type AddCommentResult = ServiceResult & { commentId?: string };

export type CommentVoteType = 'upvote' | 'downvote';

export const addComment = async (
  wordId: string,
  userId: string,
  content: string,
  parentCommentId: string | null = null,
): Promise<AddCommentResult> => {
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
      isDeleted: false,
    };

    const commentRef = await addDoc(collection(db, 'comments'), commentData);

    if (parentCommentId) {
      await updateDoc(doc(db, 'comments', parentCommentId), {
        replyCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    }

    await updateDoc(doc(db, 'words', wordId), {
      commentsCount: increment(1),
      updatedAt: serverTimestamp(),
    });

    return { success: true, commentId: commentRef.id };
  } catch (error) {
    console.error('Error adding comment:', error);
    return { success: false, error: (error as Error).message };
  }
};

const hydrateUserInfo = async (userId: string): Promise<Comment['userInfo']> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (!userDoc.exists()) return undefined;
  const data = userDoc.data();
  return {
    displayName: data.displayName || data.email || 'Anonymous',
    email: data.email,
  };
};

const toComment = (
  id: string,
  raw: Record<string, unknown>,
): Comment => {
  const createdAt = raw.createdAt as { toDate?: () => Date } | undefined;
  const updatedAt = raw.updatedAt as { toDate?: () => Date } | undefined;
  return {
    id,
    ...(raw as Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>),
    createdAt: createdAt?.toDate?.() ?? null,
    updatedAt: updatedAt?.toDate?.() ?? null,
  } as Comment;
};

export const getRepliesForComment = async (
  parentCommentId: string,
  currentDepth = 0,
  maxDepth = 10,
): Promise<Comment[]> => {
  try {
    if (currentDepth >= maxDepth) return [];

    const q = query(
      collection(db, 'comments'),
      where('parentCommentId', '==', parentCommentId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc'),
    );

    const querySnapshot = await getDocs(q);
    const replies: Comment[] = [];

    for (const document of querySnapshot.docs) {
      const commentData = document.data();
      const reply = toComment(document.id, commentData);
      reply.userInfo = await hydrateUserInfo(commentData.userId);

      if (currentDepth < 3) {
        reply.replies = await getRepliesForComment(
          document.id,
          currentDepth + 1,
          maxDepth,
        );
      } else {
        reply.hasReplies = (commentData.replyCount || 0) > 0;
        reply.repliesLoaded = false;
        reply.replies = [];
      }
      replies.push(reply);
    }
    return replies;
  } catch (error) {
    console.error('Error fetching replies:', error);
    return [];
  }
};

export const getCommentsForWord = async (
  wordId: string,
): Promise<ServiceResult & { comments?: Comment[] }> => {
  try {
    const q = query(
      collection(db, 'comments'),
      where('wordId', '==', wordId),
      where('parentCommentId', '==', null),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'desc'),
    );

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    for (const document of querySnapshot.docs) {
      const commentData = document.data();
      const comment = toComment(document.id, commentData);
      comment.userInfo = await hydrateUserInfo(commentData.userId);
      comment.replies = await getRepliesForComment(document.id);
      comments.push(comment);
    }

    return { success: true, comments };
  } catch (error) {
    console.error('Error fetching comments:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const loadRepliesForComment = async (
  parentCommentId: string,
  currentDepth = 0,
  maxDepth = 10,
): Promise<ServiceResult & { replies?: Comment[] }> => {
  try {
    if (currentDepth >= maxDepth) return { success: true, replies: [] };

    const q = query(
      collection(db, 'comments'),
      where('parentCommentId', '==', parentCommentId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc'),
    );

    const querySnapshot = await getDocs(q);
    const replies: Comment[] = [];

    for (const document of querySnapshot.docs) {
      const commentData = document.data();
      const reply = toComment(document.id, commentData);
      reply.hasReplies = (commentData.replyCount || 0) > 0;
      reply.repliesLoaded = false;
      reply.replies = [];
      reply.userInfo = await hydrateUserInfo(commentData.userId);
      replies.push(reply);
    }

    return { success: true, replies };
  } catch (error) {
    console.error('Error loading replies:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const voteOnComment = async (
  commentId: string,
  userId: string,
  voteType: CommentVoteType,
): Promise<ServiceResult & { message?: string }> => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
      return { success: false, error: 'Comment not found' };
    }

    const commentData = commentDoc.data();
    const upvotedBy: string[] = commentData.upvotedBy || [];
    const downvotedBy: string[] = commentData.downvotedBy || [];
    const hasUpvoted = upvotedBy.includes(userId);
    const hasDownvoted = downvotedBy.includes(userId);

    const updateData: Record<string, unknown> = { updatedAt: serverTimestamp() };

    if (voteType === 'upvote') {
      if (hasUpvoted) {
        updateData.upvotes = increment(-1);
        updateData.upvotedBy = arrayRemove(userId);
      } else {
        updateData.upvotes = increment(1);
        updateData.upvotedBy = arrayUnion(userId);
        if (hasDownvoted) {
          updateData.downvotes = increment(-1);
          updateData.downvotedBy = arrayRemove(userId);
        }
      }
    } else {
      if (hasDownvoted) {
        updateData.downvotes = increment(-1);
        updateData.downvotedBy = arrayRemove(userId);
      } else {
        updateData.downvotes = increment(1);
        updateData.downvotedBy = arrayUnion(userId);
        if (hasUpvoted) {
          updateData.upvotes = increment(-1);
          updateData.upvotedBy = arrayRemove(userId);
        }
      }
    }

    await updateDoc(commentRef, updateData);
    return { success: true, message: `Comment ${voteType} updated successfully` };
  } catch (error) {
    console.error('Error voting on comment:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const editComment = async (
  commentId: string,
  userId: string,
  newContent: string,
): Promise<ServiceResult & { message?: string; parentCommentId?: string | null }> => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
      return { success: false, error: 'Comment not found' };
    }
    const commentData = commentDoc.data();

    if (commentData.userId !== userId) {
      return { success: false, error: 'You can only edit your own comments' };
    }
    if (!newContent.trim()) {
      return { success: false, error: 'Comment content cannot be empty' };
    }

    await updateDoc(commentRef, {
      content: newContent.trim(),
      updatedAt: serverTimestamp(),
      isEdited: true,
    });

    return {
      success: true,
      message: 'Comment updated successfully',
      parentCommentId: commentData.parentCommentId ?? null,
    };
  } catch (error) {
    console.error('Error editing comment:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const deleteComment = async (
  commentId: string,
  userId: string,
): Promise<ServiceResult & { message?: string; parentCommentId?: string | null }> => {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    if (!commentDoc.exists()) {
      return { success: false, error: 'Comment not found' };
    }
    const commentData = commentDoc.data();

    if (commentData.userId !== userId) {
      return { success: false, error: 'You can only delete your own comments' };
    }

    await updateDoc(commentRef, {
      isDeleted: true,
      deletedAt: serverTimestamp(),
      content: '[deleted]',
      updatedAt: serverTimestamp(),
    });

    if (commentData.parentCommentId) {
      await updateDoc(doc(db, 'comments', commentData.parentCommentId), {
        replyCount: increment(-1),
        updatedAt: serverTimestamp(),
      });
    }

    await updateDoc(doc(db, 'words', commentData.wordId), {
      commentsCount: increment(-1),
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      message: 'Comment deleted successfully',
      parentCommentId: commentData.parentCommentId ?? null,
    };
  } catch (error) {
    console.error('Error deleting comment:', error);
    return { success: false, error: (error as Error).message };
  }
};

export const subscribeToWordComments = (
  wordId: string,
  callback: (comments: Comment[]) => void,
): Unsubscribe => {
  const q = query(
    collection(db, 'comments'),
    where('wordId', '==', wordId),
    where('parentCommentId', '==', null),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const comments = snapshot.docs.map((d) => toComment(d.id, d.data()));
      callback(comments);
    },
    (error) => {
      console.error('Error in comment subscription:', error);
    },
  );
};

export const reloadParentReplies = async (
  parentCommentId: string,
  currentDepth = 0,
  maxDepth = 10,
): Promise<ServiceResult & { replies?: Comment[] }> => {
  try {
    if (currentDepth >= maxDepth) return { success: true, replies: [] };

    const q = query(
      collection(db, 'comments'),
      where('parentCommentId', '==', parentCommentId),
      where('isDeleted', '==', false),
      orderBy('createdAt', 'asc'),
    );

    const querySnapshot = await getDocs(q);
    const replies: Comment[] = [];
    for (const document of querySnapshot.docs) {
      const commentData = document.data();
      const reply = toComment(document.id, commentData);
      reply.userInfo = await hydrateUserInfo(commentData.userId);

      if (currentDepth < 3) {
        reply.replies = await getRepliesForComment(
          document.id,
          currentDepth + 1,
          maxDepth,
        );
      } else {
        reply.hasReplies = (commentData.replyCount || 0) > 0;
        reply.repliesLoaded = false;
        reply.replies = [];
      }
      replies.push(reply);
    }
    return { success: true, replies };
  } catch (error) {
    console.error('Error reloading parent replies:', error);
    return { success: false, error: (error as Error).message };
  }
};
