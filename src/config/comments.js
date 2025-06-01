/**
 * Comment System Configuration
 * 
 * Centralized configuration for the comment system including nesting levels,
 * display options, and other comment-related settings.
 */

// Default maximum nesting level for comments
const DEFAULT_MAX_LEVEL = 7;

/**
 * Get the maximum comment nesting level from environment variable or use default
 * @returns {number} Maximum nesting level for comments
 */
export const getMaxCommentLevel = () => {
  const envMaxLevel = import.meta.env.VITE_COMMENT_MAX_LEVEL;
  
  if (envMaxLevel !== undefined) {
    const parsed = parseInt(envMaxLevel, 10);
    
    // Validate the parsed value
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 50) {
      return parsed;
    }
    
    // Log warning for invalid values
    console.warn(
      `Invalid VITE_COMMENT_MAX_LEVEL value: "${envMaxLevel}". ` +
      `Must be a number between 0 and 50. Using default value: ${DEFAULT_MAX_LEVEL}`
    );
  }
  
  return DEFAULT_MAX_LEVEL;
};

// Export the max level as a constant for easy access
export const MAX_COMMENT_LEVEL = getMaxCommentLevel();

// Other comment-related configuration
export const COMMENT_CONFIG = {
  maxLevel: MAX_COMMENT_LEVEL,
  autoExpandLevels: 3, // Auto-expand first 3 levels
  maxContentLength: 10000, // Maximum characters per comment
  voteThrottleMs: 1000, // Minimum time between votes
};
