/**
 * Comment System Configuration
 *
 * Centralized configuration for the comment system including nesting levels,
 * display options, and other comment-related settings.
 */

const DEFAULT_MAX_LEVEL = 7;

export const getMaxCommentLevel = (): number => {
  const envMaxLevel = import.meta.env.VITE_COMMENT_MAX_LEVEL;

  if (envMaxLevel !== undefined) {
    const parsed = parseInt(envMaxLevel, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 50) {
      return parsed;
    }
    console.warn(
      `Invalid VITE_COMMENT_MAX_LEVEL value: "${envMaxLevel}". ` +
        `Must be a number between 0 and 50. Using default value: ${DEFAULT_MAX_LEVEL}`,
    );
  }
  return DEFAULT_MAX_LEVEL;
};

export const MAX_COMMENT_LEVEL = getMaxCommentLevel();

export interface CommentConfig {
  maxLevel: number;
  autoExpandLevels: number;
  maxContentLength: number;
  voteThrottleMs: number;
}

export const COMMENT_CONFIG: CommentConfig = {
  maxLevel: MAX_COMMENT_LEVEL,
  autoExpandLevels: 3,
  maxContentLength: 10000,
  voteThrottleMs: 1000,
};
