import { AnimatePresence, motion } from 'framer-motion';
import { ChevronsRight } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import { hexToRgba } from '../../lib/utils';
import Avatar from '../ui/Avatar';

export default function NextCandidateCard() {
  const { nextCandidate: c } = useDebate();

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-studio-line px-4 py-2.5">
        <span className="text-sm font-semibold text-zinc-300">Siguiente</span>
        <span className="kbd">Enter</span>
      </div>
      <AnimatePresence mode="wait" initial={false}>
        {c ? (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 p-4"
            style={{ background: `linear-gradient(90deg, ${hexToRgba(c.color, 0.16)}, transparent 70%)` }}
          >
            <div className="rounded-[0.9rem] p-0.5" style={{ background: c.color }}>
              <Avatar candidate={c} size="lg" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-bold leading-tight text-zinc-50">{c.name}</p>
              <p className="mt-0.5 truncate text-sm" style={{ color: c.color }}>
                {c.party || 'Independiente'}
              </p>
            </div>
            <ChevronsRight className="shrink-0 text-zinc-500" size={22} />
          </motion.div>
        ) : (
          <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 text-sm text-zinc-500">
            No hay otro candidato habilitado.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
