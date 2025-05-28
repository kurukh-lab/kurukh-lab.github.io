import React, { useState, useEffect } from 'react';
import { toggleWordLike, hasUserLikedWord } from '../../services/dictionaryService';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Like button component for words with heart icon and count
 * @param {Object} props
 * @param {Object} props.word - Word object containing id and likesCount
 * @param {string} [props.size='md'] - Size of the button ('sm', 'md', 'lg')
 * @param {boolean} [props.showCount=true] - Whether to show like count
 */
const LikeButton = ({ word, size = 'md', showCount = true }) => {
  const { currentUser } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(word?.likesCount || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Size classes for different button sizes
  const sizeClasses = {
    sm: 'btn-sm text-xs',
    md: 'btn-sm text-sm',
    lg: 'btn-md text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  // Check if user has liked this word on component mount
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!word?.id) return;
      
      try {
        const userLiked = await hasUserLikedWord(word.id, currentUser?.uid);
        setLiked(userLiked);
      } catch (err) {
        console.error('Error checking like status:', err);
      }
    };

    checkLikeStatus();
  }, [word?.id, currentUser?.uid]);

  // Update like count when word prop changes
  useEffect(() => {
    setLikeCount(word?.likesCount || 0);
  }, [word?.likesCount]);

  const handleLike = async (e) => {
    // Prevent event bubbling if button is inside a clickable card
    e.preventDefault();
    e.stopPropagation();

    if (!word?.id || loading) return;

    setLoading(true);
    setError(null);

    try {
      const result = await toggleWordLike(word.id, currentUser?.uid);
      
      if (result.success) {
        setLiked(result.liked);
        setLikeCount(result.newCount);
      } else {
        setError(result.error || 'Failed to update like');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to update like');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  if (!word?.id) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleLike}
        disabled={loading}
        className={`btn btn-ghost ${sizeClasses[size]} ${
          liked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
        } transition-colors duration-200 ${loading ? 'loading' : ''}`}
        title={liked ? 'Unlike this word' : 'Like this word'}
        aria-label={`${liked ? 'Unlike' : 'Like'} word ${word.kurukh_word || ''}`}
      >
        {loading ? (
          <span className={`loading loading-spinner ${iconSizes[size]}`}></span>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`${iconSizes[size]} ${liked ? 'fill-current' : 'fill-none stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        )}
        {showCount && (
          <span className="ml-1 font-medium">
            {likeCount}
          </span>
        )}
      </button>
      
      {error && (
        <div className="tooltip tooltip-error" data-tip={error}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default LikeButton;
