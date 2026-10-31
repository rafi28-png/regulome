import { useEffect } from 'react';

/**
 * Hook to listen for keyboard shortcuts.
 * @param key - The key to listen for (e.g., 'k')
 * @param callback - Function to call when shortcut is triggered
 * @param meta - Whether Ctrl/Cmd must be held (default true)
 */
export function useKeyboardShortcut(key: string, callback: () => void, meta = true) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (meta && !(e.metaKey || e.ctrlKey)) return;
      if (e.key.toLowerCase() === key.toLowerCase()) {
        e.preventDefault();
        callback();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [key, callback, meta]);
}

export default useKeyboardShortcut;
