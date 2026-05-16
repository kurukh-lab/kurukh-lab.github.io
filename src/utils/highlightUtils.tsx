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
