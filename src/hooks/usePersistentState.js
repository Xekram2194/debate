import { useEffect, useRef, useState } from 'react';

/**
 * useState sincronizado con localStorage y entre pestañas del mismo navegador
 * (permite operar en una ventana y proyectar en otra).
 */
export function usePersistentState(key, initial, sanitize) {
  const sanitizeRef = useRef(sanitize);
  sanitizeRef.current = sanitize;

  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        return sanitize ? sanitize(parsed) : parsed;
      }
    } catch {
      /* dato corrupto: se usan valores iniciales */
    }
    return typeof initial === 'function' ? initial() : initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* almacenamiento lleno o bloqueado */
    }
  }, [key, value]);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== key || e.newValue == null) return;
      try {
        const parsed = JSON.parse(e.newValue);
        setValue(sanitizeRef.current ? sanitizeRef.current(parsed) : parsed);
      } catch {
        /* ignorar */
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [key]);

  return [value, setValue];
}
