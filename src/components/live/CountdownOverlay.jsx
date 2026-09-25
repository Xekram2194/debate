import { AnimatePresence, motion } from 'framer-motion';
import { useDebate } from '../../context/DebateContext';
import { hexToRgba } from '../../lib/utils';

const R = 46;
const CIRC = 2 * Math.PI * R;

/** Overlay 5… 4… 3… 2… 1… ¡COMIENZA! previo a cada intervención. */
export default function CountdownOverlay() {
  const { countdownValue, showGo, currentCandidate: c, activeTopic, reset } = useDebate();
  const visible = countdownValue != null || showGo;
  const color = c?.color || '#38bdf8';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="overlay"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 px-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          role="alertdialog"
          aria-label="Cuenta regresiva de inicio"
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(60% 50% at 50% 50%, ${hexToRgba(color, 0.22)}, transparent 70%)` }}
          />

          <div className="relative mb-8 text-center">
            <p className="text-lg text-zinc-400">Se prepara</p>
            <p className="font-display text-[clamp(2rem,4.5vw,4.5rem)] font-bold leading-tight" style={{ color }}>
              {c?.name}
            </p>
            {activeTopic && <p className="mt-1 text-[clamp(1rem,1.6vw,1.5rem)] text-zinc-300">{activeTopic.title}</p>}
          </div>

          <div className="relative flex h-[clamp(16rem,38vw,30rem)] w-[clamp(16rem,38vw,30rem)] items-center justify-center">
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r={R} fill="none" stroke="#27272a" strokeWidth="3" />
              {countdownValue != null && (
                <motion.circle
                  key={countdownValue}
                  cx="50"
                  cy="50"
                  r={R}
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={CIRC}
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: CIRC }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              )}
            </svg>
            <AnimatePresence mode="popLayout">
              {showGo ? (
                <motion.span
                  key="go"
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.4, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="font-display text-[clamp(3rem,8vw,7.5rem)] font-extrabold uppercase text-emerald-400 drop-shadow-[0_0_40px_rgba(52,211,153,0.7)]"
                >
                  ¡Comienza!
                </motion.span>
              ) : (
                <motion.span
                  key={countdownValue}
                  initial={{ scale: 1.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                  className="font-mono text-[clamp(8rem,22vw,20rem)] font-extrabold leading-none text-zinc-50"
                  style={{ textShadow: `0 0 80px ${hexToRgba(color, 0.7)}` }}
                >
                  {countdownValue}
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {!showGo && (
            <button type="button" onClick={reset} className="btn-ghost relative mt-10">
              Cancelar <span className="kbd">Espacio</span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
