import { motion } from 'framer-motion';
import { ListOrdered, Maximize, Minimize, Radio, Settings2, Users, Volume2, VolumeX } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import Clock from './Clock';

const TABS = [
  { id: 'live', label: 'Sala en vivo', icon: Radio },
  { id: 'topics', label: 'Ejes temáticos', icon: ListOrdered },
  { id: 'candidates', label: 'Candidatos', icon: Users },
  { id: 'settings', label: 'Ajustes', icon: Settings2 },
];

function LogoMark() {
  return (
    <svg viewBox="0 0 40 40" className="h-9 w-9 shrink-0" aria-hidden="true">
      <rect width="40" height="40" rx="10" fill="#18181b" stroke="#3f3f46" />
      <circle cx="20" cy="22" r="11" fill="none" stroke="#34d399" strokeWidth="3" />
      <rect x="17" y="5" width="6" height="4" rx="1.5" fill="#34d399" />
      <path d="M20 22V15" stroke="#fafafa" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export default function Header({ view, onViewChange, isFullscreen, onToggleFullscreen }) {
  const { config, prefs, toggleMute } = useDebate();

  return (
    <header className="sticky top-0 z-30 border-b border-studio-line bg-studio-base/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1920px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <LogoMark />
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-bold leading-none text-zinc-50 sm:text-2xl">{config.title}</h1>
            <p className="mt-1 text-xs text-zinc-500">Sala de control y cronometraje oficial</p>
          </div>
        </div>

        {!isFullscreen && (
          <nav className="order-last flex w-full gap-1 overflow-x-auto scrollbar-thin rounded-xl border border-studio-line bg-studio-panel p-1 lg:order-none lg:w-auto">
            {TABS.map(({ id, label, icon: Icon }) => {
              const active = view === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onViewChange(id)}
                  className={`relative flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    active ? 'text-zinc-50' : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                  aria-current={active ? 'page' : undefined}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 rounded-lg border border-zinc-700 bg-zinc-800"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <Icon size={16} className="relative" />
                  <span className="relative">{label}</span>
                </button>
              );
            })}
          </nav>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Clock className="hidden rounded-lg border border-studio-line bg-studio-panel px-3 py-1.5 text-sm text-zinc-200 sm:block" />
          <button
            type="button"
            onClick={toggleMute}
            className="icon-btn h-9 w-9 border border-studio-line"
            title={prefs.muted ? 'Activar sonido' : 'Silenciar sonido'}
            aria-label={prefs.muted ? 'Activar sonido' : 'Silenciar sonido'}
          >
            {prefs.muted ? <VolumeX size={17} className="text-red-400" /> : <Volume2 size={17} />}
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="icon-btn h-9 w-9 border border-studio-line"
            title="Pantalla completa (F)"
            aria-label="Alternar pantalla completa"
          >
            {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
          </button>
        </div>
      </div>
    </header>
  );
}
