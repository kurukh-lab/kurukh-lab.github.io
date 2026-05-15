import { useEffect, useRef } from 'react';

export type KeyboardHandler = (event: KeyboardEvent) => void;
export type ShortcutMap = Record<string, KeyboardHandler>;

const useKeyboardShortcut = (
  shortcuts: ShortcutMap,
  active = true,
): void => {
  const handlerRef = useRef<((event: KeyboardEvent) => void) | null>(null);

  useEffect(() => {
    if (!active) return;

    handlerRef.current = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        const isAllowedInInput = event.key === 'Escape';
        if (!isAllowedInInput) return;
      }

      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      let keyIdentifier = '';
      if (event.altKey) keyIdentifier += 'alt+';
      if (cmdOrCtrl) keyIdentifier += isMac ? 'cmd+' : 'ctrl+';
      if (event.shiftKey) keyIdentifier += 'shift+';
      keyIdentifier += event.key.toLowerCase();

      const handler = shortcuts[keyIdentifier];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    };

    const listener = handlerRef.current;
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [shortcuts, active]);
};

export default useKeyboardShortcut;
