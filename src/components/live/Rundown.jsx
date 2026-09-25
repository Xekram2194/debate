import { Check, Mic, RotateCcw } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import Avatar from '../ui/Avatar';

/** Escaleta: orden de intervenciones del eje temático en curso. */
export default function Rundown() {
  const { enabledCandidates, currentCandidate, spokenIds, selectCandidate, timer, resetRound } = useDebate();
  const locked = timer.status === 'running' || timer.status === 'countdown';
  const done = enabledCandidates.filter((c) => spokenIds.includes(c.id)).length;

  return (
    <div className="panel flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-studio-line px-4 py-2.5">
        <span className="text-sm font-semibold text-zinc-300">
          Escaleta <span className="ml-1 font-mono text-xs tabular text-zinc-500">{done}/{enabledCandidates.length}</span>
        </span>
        <button type="button" onClick={resetRound} disabled={locked} className="icon-btn" title="Reiniciar la ronda de este eje">
          <RotateCcw size={15} />
        </button>
      </div>
      <ol className="scrollbar-thin min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {enabledCandidates.map((c, i) => {
          const isCurrent = c.id === currentCandidate?.id;
          const spoke = spokenIds.includes(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={locked || isCurrent}
                onClick={() => selectCandidate(c.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-colors disabled:cursor-default ${
                  isCurrent ? 'bg-zinc-800/90' : 'hover:bg-zinc-800/50'
                }`}
                title={locked ? 'Detén el turno para cambiar de candidato' : `Pasar el turno a ${c.name}`}
              >
                <span className="w-5 text-right font-mono text-xs tabular text-zinc-500">{i + 1}</span>
                <span className="h-7 w-1 rounded-full" style={{ background: c.color }} />
                <Avatar candidate={c} size="sm" dimmed={spoke && !isCurrent} />
                <span className={`min-w-0 flex-1 truncate text-sm ${spoke && !isCurrent ? 'text-zinc-500' : 'text-zinc-200'}`}>
                  {c.name}
                </span>
                {isCurrent ? (
                  <Mic size={15} className="text-red-400" />
                ) : spoke ? (
                  <Check size={15} className="text-emerald-500" />
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
