import { useEffect, useState } from 'react';
import { hexToRgba, initials } from '../../lib/utils';

const SIZES = {
  sm: 'h-9 w-9 text-xs rounded-lg',
  md: 'h-12 w-12 text-sm rounded-xl',
  lg: 'h-20 w-20 text-2xl rounded-2xl',
  xl: 'h-[clamp(7rem,13vw,14rem)] w-[clamp(7rem,13vw,14rem)] text-[clamp(2.5rem,5vw,5rem)] rounded-[1.75rem]',
};

/** Foto del candidato con respaldo de iniciales en su color oficial. */
export default function Avatar({ candidate, size = 'md', className = '', dimmed = false }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [candidate?.avatar]);

  const color = candidate?.color || '#64748b';
  const base = `${SIZES[size]} shrink-0 overflow-hidden ${dimmed ? 'grayscale opacity-50' : ''} ${className}`;

  if (!candidate?.avatar || failed) {
    return (
      <div
        className={`${base} flex items-center justify-center font-display font-bold text-white`}
        style={{ background: `linear-gradient(145deg, ${hexToRgba(color, 0.95)}, ${hexToRgba(color, 0.45)})` }}
        aria-hidden="true"
      >
        {initials(candidate?.name)}
      </div>
    );
  }
  return (
    <img
      src={candidate.avatar}
      alt={`Foto de ${candidate.name}`}
      className={`${base} bg-zinc-900 object-cover`}
      onError={() => setFailed(true)}
      draggable={false}
    />
  );
}
