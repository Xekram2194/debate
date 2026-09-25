import { Maximize, Minimize, Pause, Play, RotateCcw, SkipBack, SkipForward, X } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';

function Ctrl({ onClick, icon: Icon, label, kbd, variant = 'ghost', disabled, className = '' }) {
  const styles = {
    ghost: 'border border-studio-line bg-studio-raised text-zinc-200 hover:border-zinc-600 hover:bg-zinc-800',
    go: 'bg-emerald-500 text-zinc-950 hover:bg-emerald-400',
    pause: 'bg-amber-400 text-zinc-950 hover:bg-amber-300',
    next: 'bg-sky-500 text-zinc-950 hover:bg-sky-400',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`btn h-12 px-4 text-base ${styles[variant]} ${className}`}
    >
      <Icon size={19} />
      <span>{label}</span>
      {kbd && (
        <span
          className={`kbd ml-1 hidden md:inline-flex ${
            variant === 'ghost' ? '' : '!border-black/25 !bg-black/15 !text-zinc-950'
          }`}
        >
          {kbd}
        </span>
      )}
    </button>
  );
}

export default function ControlBar({ isFullscreen, onToggleFullscreen }) {
  const { timer, toggle, reset, next, previous, currentCandidate, totalMs, enabledCandidates } = useDebate();
  const s = timer.status;
  const main =
    s === 'running'
      ? { label: 'Pausar', icon: Pause, variant: 'pause' }
      : s === 'paused'
        ? { label: 'Reanudar', icon: Play, variant: 'go' }
        : s === 'countdown'
          ? { label: 'Cancelar', icon: X, variant: 'ghost' }
          : { label: s === 'finished' ? 'Repetir turno' : 'Iniciar turno', icon: Play, variant: 'go' };

  const noCandidate = !currentCandidate || totalMs <= 0;

  return (
    <div
      className={`panel flex flex-wrap items-center gap-2 p-2.5 transition-opacity ${
        isFullscreen ? 'opacity-30 hover:opacity-100 focus-within:opacity-100' : ''
      }`}
    >
      <Ctrl onClick={previous} icon={SkipBack} label="Anterior" disabled={enabledCandidates.length < 2 || s === 'running' || s === 'countdown'} />
      <Ctrl onClick={toggle} icon={main.icon} label={main.label} kbd="Espacio" variant={main.variant} disabled={noCandidate} className="min-w-[11rem] flex-1 sm:flex-none" />
      <Ctrl onClick={reset} icon={RotateCcw} label="Reiniciar" kbd="R" disabled={noCandidate} />
      <Ctrl onClick={next} icon={SkipForward} label="Detener / Siguiente" kbd="Enter" variant="next" disabled={!currentCandidate} className="flex-1 sm:flex-none" />
      <div className="ml-auto">
        <Ctrl onClick={onToggleFullscreen} icon={isFullscreen ? Minimize : Maximize} label={isFullscreen ? 'Salir' : 'Pantalla completa'} kbd="F" />
      </div>
    </div>
  );
}
