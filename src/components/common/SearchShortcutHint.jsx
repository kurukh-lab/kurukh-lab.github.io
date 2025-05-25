import React from 'react';

/**
 * Displays search shortcuts similar to popular search engines
 */
const SearchShortcutHint = () => {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  return (
    <div className="flex items-center justify-center mt-4 text-xs text-neutral-content gap-4">
      <div className="flex items-center">
        <kbd className="kbd kbd-sm mr-1">{isMac ? '⌘' : 'Ctrl'}</kbd>
        <kbd className="kbd kbd-sm">K</kbd>
        <span className="ml-2">to search</span>
      </div>
      
      <div className="flex items-center">
        <kbd className="kbd kbd-sm mr-1">Tab</kbd>
        <span className="ml-1">to navigate</span>
      </div>
      
      <div className="flex items-center">
        <kbd className="kbd kbd-sm mr-1">↑</kbd>
        <kbd className="kbd kbd-sm mr-1">↓</kbd>
        <span className="ml-1">to browse results</span>
      </div>
    </div>
  );
};

export default SearchShortcutHint;
