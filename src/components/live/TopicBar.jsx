import { ChevronDown, Layers } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import { formatDuration } from '../../lib/utils';

const LIVE = {
  idle: { label: 'En espera', cls: 'border-zinc-700 text-zinc-300', dot: 'bg-zinc-500' },
  countdown: { label: 'Preparando', cls: 'border-amber-500/50 text-amber-300', dot: 'bg-amber-400 animate-blink' },
  running: { label: 'En vivo', cls: 'border-red-500/60 bg-red-500/10 text-red-300', dot: 'bg-red-500 animate-blink' },
  paused: { label: 'Pausa', cls: 'border-sky-500/50 text-sky-300', dot: 'bg-sky-400' },
  finished: { label: 'Finalizado', cls: 'border-red-500/60 text-red-300', dot: 'bg-red-500' },
};

export default function TopicBar() {
  const { topics, activeTopic, selectTopic, timer } = useDebate();
  const locked = timer.status === 'running' || timer.status === 'countdown';
  const live = LIVE[timer.status] || LIVE.idle;
  const idx = topics.findIndex((t) => t.id === activeTopic?.id);

  return (
    <div className="panel flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Layers size={20} className="shrink-0 text-sky-400" />
        <div className="min-w-0">
          <p className="text-xs text-zinc-500">
            Eje temático en curso {idx >= 0 && <span className="font-mono tabular">· {idx + 1} de {topics.length}</span>}
          </p>
          <p className="truncate font-display text-[clamp(1.35rem,2.2vw,2.25rem)] font-bold leading-tight text-zinc-50">
            {activeTopic?.title || 'Crea un eje temático para empezar'}
          </p>
        </div>
      </div>

      <label className="relative flex items-center" title={locked ? 'Detén el turno para cambiar de eje' : 'Cambiar eje temático'}>
        <span className="sr-only">Seleccionar eje temático</span>
        <select
          value={activeTopic?.id || ''}
          onChange={(e) => selectTopic(e.target.value)}
          disabled={locked || topics.length === 0}
          className="field max-w-[18rem] cursor-pointer appearance-none pr-9 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {topics.map((t, i) => (
            <option key={t.id} value={t.id}>
              {i + 1}. {t.title} ({formatDuration(t.durationMinutes, t.durationSeconds)})
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 text-zinc-500" />
      </label>

      <span className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-bold ${live.cls}`}>
        <span className={`h-2.5 w-2.5 rounded-full ${live.dot}`} />
        {live.label}
      </span>
    </div>
  );
}
