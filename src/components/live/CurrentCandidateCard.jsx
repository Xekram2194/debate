import { AnimatePresence, motion } from 'framer-motion';
import { UserX } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import { hexToRgba } from '../../lib/utils';
import Avatar from '../ui/Avatar';

export default function CurrentCandidateCard() {
  const { currentCandidate: c, currentIndex, enabledCandidates, timer } = useDebate();
  const live = timer.status === 'running';

  if (!c) {
    return (
      <div className="panel flex h-full min-h-[340px] flex-col items-center justify-center gap-3 p-6 text-center text-zinc-400">
        <UserX size={32} />
        <p className="font-semibold text-zinc-200">No hay candidatos habilitados</p>
        <p className="text-sm">Habilita al menos uno en la pestaña Candidatos.</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.article
        key={c.id}
        initial={{ opacity: 0, x: -40, scale: 0.97 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 40, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl border bg-studio-panel"
        style={{
          borderColor: hexToRgba(c.color, 0.8),
          boxShadow: `0 0 0 1px ${hexToRgba(c.color, 0.35)}, 0 0 70px -18px ${hexToRgba(c.color, 0.8)}`,
        }}
        aria-label={`Candidato en turno: ${c.name}`}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(120% 70% at 50% 0%, ${hexToRgba(c.color, 0.28)}, transparent 65%)` }}
        />
        <div className="relative flex items-center justify-between px-5 pt-4">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200">
            <span className={`h-2.5 w-2.5 rounded-full ${live ? 'animate-blink bg-red-500' : 'bg-zinc-500'}`} />
            En turno
          </span>
          <span className="font-mono text-sm tabular text-zinc-400">
            {currentIndex + 1} / {enabledCandidates.length}
          </span>
        </div>

        <div className="relative flex flex-1 flex-col items-center justify-center gap-5 px-5 py-6 text-center">
          <div
            className="rounded-[2rem] p-1.5"
            style={{ background: `linear-gradient(160deg, ${c.color}, ${hexToRgba(c.color, 0.15)})` }}
          >
            <Avatar candidate={c} size="xl" />
          </div>
          <div>
            <h2 className="font-display text-[clamp(1.75rem,2.6vw,3rem)] font-bold leading-[1.05] text-zinc-50">{c.name}</h2>
            <p className="mt-2 text-[clamp(0.95rem,1.2vw,1.25rem)] font-medium" style={{ color: c.color }}>
              {c.party || 'Independiente'}
            </p>
          </div>
        </div>
        <div className="relative h-2" style={{ background: c.color }} />
      </motion.article>
    </AnimatePresence>
  );
}
