import { motion } from 'framer-motion';
import { useDebate } from '../../context/DebateContext';
import { getPhase } from '../../lib/phase';
import ControlBar from './ControlBar';
import CountdownOverlay from './CountdownOverlay';
import CurrentCandidateCard from './CurrentCandidateCard';
import NextCandidateCard from './NextCandidateCard';
import Rundown from './Rundown';
import TimerPanel from './TimerPanel';
import TopicBar from './TopicBar';

export default function LiveRoom({ isFullscreen, onToggleFullscreen }) {
  const { remainingMs, config, timer } = useDebate();
  const phase = getPhase(remainingMs, config);
  const tinted = timer.status === 'running' || timer.status === 'finished';

  return (
    <div className="relative flex h-full flex-col gap-4">
      {/* Iluminación ambiental del estudio según el semáforo */}
      <motion.div
        className="pointer-events-none fixed inset-0 -z-10"
        animate={{
          background: tinted
            ? `radial-gradient(70% 55% at 50% 45%, ${phase.color}1f, transparent 70%)`
            : 'radial-gradient(70% 55% at 50% 45%, rgba(56,189,248,0.05), transparent 70%)',
        }}
        transition={{ duration: 0.8 }}
      />

      <TopicBar />

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-3">
          <CurrentCandidateCard />
        </div>
        <div className="order-1 lg:order-2 lg:col-span-6">
          <TimerPanel />
        </div>
        <aside className="order-3 flex min-h-0 flex-col gap-4 lg:col-span-3" aria-label="Orden de intervenciones">
          <NextCandidateCard />
          <Rundown />
        </aside>
      </div>

      <ControlBar isFullscreen={isFullscreen} onToggleFullscreen={onToggleFullscreen} />
      <CountdownOverlay />
    </div>
  );
}
