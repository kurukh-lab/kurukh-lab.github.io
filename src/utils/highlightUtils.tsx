import type { ReactNode } from 'react';

/**
 * Utility functions for highlighting search terms in text/result content.
 */

export const highlightText = (
  text: string | undefined | null,
  searchTerm: string | undefined | null,
): ReactNode => {
  if (!text || !searchTerm) return text;

  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return (
        <span
          key={index}
          className="bg-yellow-300 text-yellow-900 px-1 rounded font-semibold"
          style={{ backgroundColor: '#fef08a', color: '#854d0e' }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};

export const highlightContent = (
  content: ReactNode,
  searchTerm: string,
): ReactNode => {
  if (typeof content === 'string') return highlightText(content, searchTerm);
  return content;
};

/**
 * Highlight matches with the design's soft terracotta underline — used in
 * search results to show *why* a word was a hit. Falls back to the raw text
 * when the term is empty or the text doesn't contain it.
 */
export const highlightMatch = (
  text: string | undefined | null,
  searchTerm: string | undefined | null,
): ReactNode => {
  if (!text) return text;
  const needle = searchTerm?.trim();
  if (!needle) return text;

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  if (parts.length === 1) return text;

  return parts.map((part, index) => {
    if (part.toLowerCase() === needle.toLowerCase()) {
      return (
        <span
          key={index}
          style={{
            background:
              'linear-gradient(transparent 85%, var(--kd-accent-soft) 85%)',
            paddingBottom: '0.05em',
          }}
        >
          {part}
        </span>
      );
    }
    return part;
  });
};
