import { HardDrive } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';

const STATUS = {
  idle: { label: 'Sistema listo', dot: 'bg-emerald-400' },
  countdown: { label: 'Cuenta regresiva', dot: 'bg-amber-400' },
  running: { label: 'Transmitiendo', dot: 'bg-red-500' },
  paused: { label: 'Turno en pausa', dot: 'bg-sky-400' },
  finished: { label: 'Turno finalizado', dot: 'bg-zinc-400' },
};

export default function Footer({ compact = false }) {
  const { timer } = useDebate();
  const status = STATUS[timer.status] || STATUS.idle;

  return (
    <footer className="border-t border-studio-line bg-studio-base/95">
      <div
        className={`mx-auto flex max-w-[1920px] flex-wrap items-center justify-between gap-3 px-4 sm:px-6 ${
          compact ? 'py-2' : 'py-3.5'
        }`}
      >
        <p className="text-sm text-zinc-400">
          Desarrollado por{' '}
          <span className="font-display text-base font-bold tracking-wide text-zinc-50">XEKRAM COMPANY</span>
        </p>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-studio-line bg-studio-panel px-3 py-1 text-xs font-medium text-zinc-300">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${status.dot}`} />
              <span className={`relative inline-flex h-2 w-2 rounded-full ${status.dot}`} />
            </span>
            {status.label}
          </span>
          <span
            className="hidden items-center gap-1.5 rounded-full border border-studio-line bg-studio-panel px-3 py-1 text-xs text-zinc-400 sm:inline-flex"
            title="Todos los cambios se guardan automáticamente en este navegador"
          >
            <HardDrive size={12} /> Autoguardado local
          </span>
          <span className="font-mono text-[11px] text-zinc-600">v1.0</span>
        </div>
      </div>
    </footer>
  );
}
