import { AnimatePresence, motion } from 'framer-motion';
import CandidatesPanel from './components/candidates/CandidatesPanel';
import Footer from './components/layout/Footer';
import Header from './components/layout/Header';
import LiveRoom from './components/live/LiveRoom';
import SettingsPanel from './components/settings/SettingsPanel';
import TopicsPanel from './components/topics/TopicsPanel';
import { useDebate } from './context/DebateContext';
import { useFullscreen } from './hooks/useFullscreen';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const VIEWS = { topics: TopicsPanel, candidates: CandidatesPanel, settings: SettingsPanel };

export default function App() {
  const { prefs, setView, toggle, next, reset } = useDebate();
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen();
  const view = isFullscreen ? 'live' : prefs.view;

  const goFullscreen = () => {
    if (!isFullscreen) setView('live');
    toggleFullscreen();
  };

  useKeyboardShortcuts({
    f: goFullscreen,
    ...(view === 'live' ? { ' ': toggle, Enter: next, r: reset } : {}),
  });

  const Panel = VIEWS[view];

  return (
    <div className={`studio-grid flex flex-col ${isFullscreen ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Header view={view} onViewChange={setView} isFullscreen={isFullscreen} onToggleFullscreen={goFullscreen} />

      <main className={`mx-auto flex w-full max-w-[1920px] flex-1 flex-col px-4 sm:px-6 ${isFullscreen ? 'min-h-0 py-4' : 'py-6'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            className="flex min-h-0 flex-1 flex-col"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {view === 'live' ? <LiveRoom isFullscreen={isFullscreen} onToggleFullscreen={goFullscreen} /> : <Panel />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer compact={isFullscreen} />
    </div>
  );
}
