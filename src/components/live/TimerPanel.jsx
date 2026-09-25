import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CirclePause, Clock3, Hourglass, Mic, OctagonAlert } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import { getPhase } from '../../lib/phase';
import { formatClock } from '../../lib/utils';
import RollingDigit from './RollingDigit';

const ICONS = { normal: Mic, warning: AlertTriangle, critical: OctagonAlert, over: OctagonAlert };

export default function TimerPanel() {
  const { timer, remainingMs, totalMs, config } = useDebate();
  const phase = getPhase(remainingMs, config);
  const clock = formatClock(remainingMs);
  const [mm, ss] = clock.split(':');
  const progress = totalMs > 0 ? Math.min(1, remainingMs / totalMs) : 0;
  const elapsed = Math.max(0, totalMs - remainingMs);

  const running = timer.status === 'running';
  const finished = timer.status === 'finished';
  const blinking = (running && phase.key === 'critical') || finished;

  let statusLabel = phase.label;
  let StatusIcon = ICONS[phase.key];
  if (timer.status === 'idle' || timer.status === 'countdown') {
    statusLabel = 'Listo para iniciar';
    StatusIcon = Hourglass;
  } else if (timer.status === 'paused') {
    statusLabel = 'Intervención en pausa';
    StatusIcon = CirclePause;
  }
  const active = running || finished;
  const accent = active ? phase.color : timer.status === 'paused' ? '#38bdf8' : '#a1a1aa';

  const warnPos = totalMs > 0 ? Math.min(100, ((config.warningThresholdSeconds * 1000) / totalMs) * 100) : 0;
  const critPos = totalMs > 0 ? Math.min(100, ((config.criticalThresholdSeconds * 1000) / totalMs) * 100) : 0;

  return (
    <motion.section
      aria-label="Cronómetro oficial"
      className="relative flex h-full min-h-[340px] flex-col overflow-hidden rounded-2xl border bg-studio-panel"
      animate={{
        borderColor: active ? `${phase.color}99` : '#27272a',
        boxShadow: active ? `0 0 80px -20px ${phase.color}88, inset 0 0 120px -60px ${phase.color}66` : '0 0 0 0 transparent',
      }}
      transition={{ duration: 0.5 }}
    >
      {/* Estado */}
      <div className="flex items-center justify-between gap-3 border-b border-studio-line px-5 py-3">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={finished ? 'over' : statusLabel}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2.5 rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{ color: accent, backgroundColor: `${accent}1a`, boxShadow: `inset 0 0 0 1px ${accent}40` }}
          >
            <StatusIcon size={16} />
            {statusLabel}
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <Clock3 size={15} />
          Tiempo asignado <span className="font-mono tabular font-bold text-zinc-200">{formatClock(totalMs)}</span>
        </div>
      </div>

      {/* Dígitos */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-6">
        <motion.div
          className="font-mono font-extrabold leading-none tabular"
          style={{ fontSize: 'clamp(5rem, 14vw, 17rem)', letterSpacing: '-0.02em' }}
          animate={{
            color: active || timer.status === 'paused' ? phase.color : '#fafafa',
            opacity: blinking ? [1, 0.3, 1] : 1,
            filter: active ? `drop-shadow(0 0 36px ${phase.color}70)` : 'drop-shadow(0 0 0px rgba(0,0,0,0))',
          }}
          transition={blinking ? { opacity: { duration: finished ? 0.9 : 0.6, repeat: Infinity }, color: { duration: 0.4 } } : { duration: 0.4 }}
          role="timer"
          aria-live="off"
          aria-label={`Tiempo restante ${clock}`}
        >
          <RollingDigit value={mm[0]} />
          <RollingDigit value={mm[1]} />
          <span className={`inline-block w-[0.45em] text-center ${running ? 'animate-blink-slow' : ''}`}>:</span>
          <RollingDigit value={ss[0]} />
          <RollingDigit value={ss[1]} />
        </motion.div>

        <AnimatePresence>
          {finished && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-lg bg-red-600 px-6 py-2 font-display text-[clamp(1.5rem,3.2vw,3.25rem)] font-extrabold uppercase tracking-wide text-white shadow-[0_0_60px_-10px_rgba(239,68,68,0.9)]"
            >
              Tiempo agotado
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de progreso decreciente */}
      <div className="px-5 pb-5">
        <div className="relative h-4 overflow-hidden rounded-full bg-zinc-900 ring-1 ring-inset ring-zinc-800">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            animate={{ width: `${progress * 100}%`, backgroundColor: phase.color }}
            transition={{ width: { duration: running ? 0.12 : 0.4, ease: 'linear' }, backgroundColor: { duration: 0.4 } }}
            style={{ boxShadow: `0 0 20px ${phase.color}aa` }}
          />
          {warnPos > 0 && warnPos < 100 && (
            <span className="absolute inset-y-0 w-px bg-amber-300/70" style={{ left: `${warnPos}%` }} title="Umbral de alerta" />
          )}
          {critPos > 0 && critPos < 100 && (
            <span className="absolute inset-y-0 w-px bg-red-400/80" style={{ left: `${critPos}%` }} title="Umbral crítico" />
          )}
        </div>
        <div className="mt-2 flex justify-between text-xs text-zinc-500">
          <span>
            Transcurrido <span className="font-mono tabular text-zinc-300">{formatClock(elapsed)}</span>
          </span>
          <span className="hidden sm:inline">
            Alerta a los {config.warningThresholdSeconds}s, crítico a los {config.criticalThresholdSeconds}s
          </span>
        </div>
      </div>
    </motion.section>
  );
}
