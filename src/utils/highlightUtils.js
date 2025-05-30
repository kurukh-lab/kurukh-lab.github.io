/**
 * Utility functions for highlighting text in search results
 */

/**
 * Highlights search terms in text with yellow background
 * @param {string} text - The text to highlight
 * @param {string} searchTerm - The search term to highlight
 * @returns {JSX.Element} - Text with highlighted search terms
 */
export const highlightText = (text, searchTerm) => {
  if (!text || !searchTerm) {
    return text;
  }

  // Escape special regex characters in search term
  const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create regex for case-insensitive matching
  const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
  
  // Split the text by the search term
  const parts = text.split(regex);
  
  return parts.map((part, index) => {
    // Check if this part matches the search term (case-insensitive)
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

/**
 * Highlights search terms in React elements or strings
 * @param {string|React.ReactElement} content - The content to highlight
 * @param {string} searchTerm - The search term to highlight
 * @returns {React.ReactElement} - Content with highlighted search terms
 */
export const highlightContent = (content, searchTerm) => {
  if (typeof content === 'string') {
    return highlightText(content, searchTerm);
  }
  return content;
};
