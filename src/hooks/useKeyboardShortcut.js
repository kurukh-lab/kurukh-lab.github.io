import { useEffect, useRef } from 'react';

/**
 * Custom hook to manage keyboard shortcuts
 * @param {Object} shortcuts - Object mapping key combinations to handler functions
 * @param {boolean} [active=true] - Whether shortcuts are active
 */
const useKeyboardShortcut = (shortcuts, active = true) => {
  const handlerRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    handlerRef.current = (event) => {
      // Skip if user is typing in an input, textarea, or contentEditable element
      if (
        event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.isContentEditable
      ) {
        // Allow specific shortcuts to work even in input fields
        const isAllowedInInput = event.key === 'Escape';
        if (!isAllowedInInput) return;
      }

      // Check for modifier keys
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;
      
      // Create key identifier (e.g. "ctrl+k" or "cmd+k")
      let keyIdentifier = '';
      if (event.altKey) keyIdentifier += 'alt+';
      if (cmdOrCtrl) keyIdentifier += isMac ? 'cmd+' : 'ctrl+';
      if (event.shiftKey) keyIdentifier += 'shift+';
      
      // Add the main key (convert to lowercase for consistency)
      keyIdentifier += event.key.toLowerCase();

      // Execute handler if there's a match
      if (shortcuts[keyIdentifier]) {
        event.preventDefault();
        shortcuts[keyIdentifier](event);
      }
    };

    window.addEventListener('keydown', handlerRef.current);
    
    return () => {
      window.removeEventListener('keydown', handlerRef.current);
    };
  }, [shortcuts, active]);
};

export default useKeyboardShortcut;
