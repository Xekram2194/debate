import { useEffect, useState } from 'react';

export default function Clock({ className = '' }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <time className={`font-mono tabular font-bold ${className}`} dateTime={now.toISOString()}>
      {now.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
    </time>
  );
}
