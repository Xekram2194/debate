import { useEffect, useState } from 'react';

/** Botón que pide un segundo clic antes de ejecutar una acción destructiva. */
export default function ConfirmButton({ onConfirm, children, confirmLabel = '¿Confirmar?', className = 'icon-btn', title, ...rest }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return undefined;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <button
      type="button"
      title={armed ? 'Haz clic otra vez para confirmar' : title}
      className={`${className} ${armed ? '!w-auto !bg-red-600 px-2 !text-white text-xs font-semibold' : ''}`}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
      {...rest}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}
