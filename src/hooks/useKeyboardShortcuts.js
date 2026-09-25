import { useEffect, useRef } from 'react';

const isTypingTarget = (el) =>
  el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

/**
 * Atajos globales. `handlers` es un mapa { ' ': fn, Enter: fn, r: fn, f: fn }.
 * Se ignoran mientras se escribe en formularios.
 */
export function useKeyboardShortcuts(handlers) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || isTypingTarget(e.target)) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const fn = ref.current[key];
      if (fn) {
        e.preventDefault();
        fn(e);
      }
    };
    // Evita que Espacio "haga clic" en el botón enfocado al soltar la tecla.
    const onKeyUp = (e) => {
      if (e.key === ' ' && !isTypingTarget(e.target) && ref.current[' ']) e.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);
}
