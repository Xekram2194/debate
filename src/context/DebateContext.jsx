import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_DATA } from '../data/defaultData';
import { usePersistentState } from '../hooks/usePersistentState';
import { sounds, unlockAudio } from '../lib/audio';
import { normalizeData, topicDurationMs, uid } from '../lib/utils';

const DebateContext = createContext(null);

export const STORAGE_KEYS = {
  data: 'xekram-debate:data',
  timer: 'xekram-debate:timer',
  prefs: 'xekram-debate:prefs',
};

/**
 * El cronómetro se modela con marcas de tiempo absolutas (endAt, countdownEndsAt)
 * en lugar de restar segundos. Así no acumula deriva, sobrevive a recargas de
 * página y dos pestañas (operador + proyección) calculan exactamente lo mismo.
 */
const IDLE = { status: 'idle', remainingMs: null, endAt: null, countdownEndsAt: null, startedAt: null };

export function DebateProvider({ children }) {
  const [data, setData] = usePersistentState(STORAGE_KEYS.data, () => normalizeData(DEFAULT_DATA), normalizeData);
  const [timer, setTimer] = usePersistentState(STORAGE_KEYS.timer, IDLE);
  const [prefs, setPrefs] = usePersistentState(STORAGE_KEYS.prefs, { muted: false, view: 'live' });
  const [now, setNow] = useState(() => Date.now());

  const { debateConfig: config, topics, candidates } = data;

  // ---------- Derivados ----------
  const activeTopic = topics.find((t) => t.id === data.activeTopicId) || topics[0] || null;
  const totalMs = activeTopic ? topicDurationMs(activeTopic) : 0;
  const enabledCandidates = useMemo(() => candidates.filter((c) => c.enabled), [candidates]);
  const foundIndex = enabledCandidates.findIndex((c) => c.id === data.currentCandidateId);
  const currentIndex = foundIndex >= 0 ? foundIndex : 0;
  const currentCandidate = enabledCandidates[currentIndex] || null;
  const nextCandidate =
    enabledCandidates.length > 1 ? enabledCandidates[(currentIndex + 1) % enabledCandidates.length] : null;
  const spokenIds = (activeTopic && data.spoken?.[activeTopic.id]) || [];

  const remainingMs =
    timer.status === 'running'
      ? Math.max(0, timer.endAt - now)
      : timer.status === 'finished'
        ? 0
        : timer.remainingMs ?? totalMs;

  const countdownValue =
    timer.status === 'countdown'
      ? Math.max(1, Math.min(config.countdownIntroSeconds, Math.ceil((timer.countdownEndsAt - now) / 1000)))
      : null;

  const showGo =
    timer.status === 'running' && timer.startedAt != null && now >= timer.startedAt && now - timer.startedAt < 1100;

  // ---------- Sonido ----------
  const mutedRef = useRef(prefs.muted);
  mutedRef.current = prefs.muted;
  const play = useCallback((name) => {
    if (!mutedRef.current) sounds[name]?.();
  }, []);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  // ---------- Integridad ----------
  useEffect(() => {
    if (currentCandidate && currentCandidate.id !== data.currentCandidateId) {
      setData((d) => ({ ...d, currentCandidateId: currentCandidate.id }));
    }
  }, [currentCandidate, data.currentCandidateId, setData]);

  // En espera, el reloj siempre refleja la duración del tema activo.
  useEffect(() => {
    if (timer.status === 'idle' && timer.remainingMs !== totalMs) {
      setTimer({ ...IDLE, remainingMs: totalMs });
    }
  }, [timer.status, timer.remainingMs, totalMs, setTimer]);

  // ---------- Reloj ----------
  const ticking = timer.status === 'countdown' || timer.status === 'running';
  useEffect(() => {
    if (!ticking) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [ticking]);

  // ---------- Transiciones y alertas sonoras ----------
  const lastSecRef = useRef(null);
  useEffect(() => {
    if (timer.status === 'countdown') {
      const left = timer.countdownEndsAt - now;
      if (left <= 0) {
        setTimer((t) =>
          t.status !== 'countdown'
            ? t
            : { ...t, status: 'running', endAt: t.countdownEndsAt + t.remainingMs, startedAt: t.countdownEndsAt, countdownEndsAt: null }
        );
        if (-left < 1500) play('go');
        lastSecRef.current = null;
        return;
      }
      const sec = Math.min(config.countdownIntroSeconds, Math.ceil(left / 1000));
      if (sec !== lastSecRef.current) {
        lastSecRef.current = sec;
        play('countdown');
      }
    } else if (timer.status === 'running') {
      const left = timer.endAt - now;
      if (left <= 0) {
        setTimer((t) => (t.status !== 'running' ? t : { ...t, status: 'finished', remainingMs: 0, endAt: null }));
        if (-left < 3000) play('timeUp');
        lastSecRef.current = null;
        return;
      }
      const sec = Math.ceil(left / 1000);
      if (lastSecRef.current !== null && sec !== lastSecRef.current) {
        if (sec === config.warningThresholdSeconds) play('warning');
        else if (sec <= config.criticalThresholdSeconds) play('critical');
      }
      lastSecRef.current = sec;
    } else {
      lastSecRef.current = null;
    }
  }, [now, timer, config.countdownIntroSeconds, config.warningThresholdSeconds, config.criticalThresholdSeconds, play, setTimer]);

  // ---------- Acciones del cronómetro ----------
  const start = useCallback(() => {
    if (!currentCandidate || totalMs <= 0) return;
    const t0 = Date.now();
    setNow(t0);
    const intro = Math.max(0, Number(config.countdownIntroSeconds) || 0);
    setTimer((t) => {
      const rem = t.status === 'finished' || !t.remainingMs || t.remainingMs <= 0 ? totalMs : t.remainingMs;
      if (intro === 0) return { ...IDLE, status: 'running', remainingMs: rem, endAt: t0 + rem, startedAt: t0 };
      return { ...IDLE, status: 'countdown', remainingMs: rem, countdownEndsAt: t0 + intro * 1000 };
    });
    if (intro === 0) play('go');
  }, [currentCandidate, totalMs, config.countdownIntroSeconds, setTimer, play]);

  const pause = useCallback(() => {
    setTimer((t) =>
      t.status !== 'running' ? t : { ...t, status: 'paused', remainingMs: Math.max(0, t.endAt - Date.now()), endAt: null }
    );
  }, [setTimer]);

  const resume = useCallback(() => {
    const t0 = Date.now();
    setNow(t0);
    setTimer((t) => (t.status !== 'paused' ? t : { ...t, status: 'running', endAt: t0 + t.remainingMs }));
  }, [setTimer]);

  const reset = useCallback(() => setTimer({ ...IDLE, remainingMs: totalMs }), [setTimer, totalMs]);

  const toggle = useCallback(() => {
    switch (timer.status) {
      case 'running':
        return pause();
      case 'paused':
        return resume();
      case 'countdown':
        return reset(); // Espacio durante la cuenta regresiva la cancela
      default:
        return start();
    }
  }, [timer.status, pause, resume, reset, start]);

  const goToCandidate = useCallback(
    (targetId, { markSpoken = false } = {}) => {
      setData((d) => {
        let spoken = d.spoken;
        if (markSpoken && activeTopic && currentCandidate) {
          const list = d.spoken?.[activeTopic.id] || [];
          if (!list.includes(currentCandidate.id)) spoken = { ...d.spoken, [activeTopic.id]: [...list, currentCandidate.id] };
        }
        return { ...d, spoken, currentCandidateId: targetId ?? d.currentCandidateId };
      });
      setTimer({ ...IDLE, remainingMs: totalMs });
    },
    [activeTopic, currentCandidate, setData, setTimer, totalMs]
  );

  const next = useCallback(() => {
    if (!currentCandidate) return;
    goToCandidate(nextCandidate?.id ?? currentCandidate.id, { markSpoken: timer.status !== 'idle' });
    play('turn');
  }, [currentCandidate, nextCandidate, goToCandidate, timer.status, play]);

  const previous = useCallback(() => {
    if (enabledCandidates.length < 2) return;
    const prev = enabledCandidates[(currentIndex - 1 + enabledCandidates.length) % enabledCandidates.length];
    goToCandidate(prev.id);
  }, [enabledCandidates, currentIndex, goToCandidate]);

  const selectCandidate = useCallback((id) => goToCandidate(id), [goToCandidate]);

  // ---------- Temas ----------
  const selectTopic = useCallback(
    (id) => {
      const topic = topics.find((t) => t.id === id);
      if (!topic) return;
      setData((d) => ({ ...d, activeTopicId: id }));
      setTimer({ ...IDLE, remainingMs: topicDurationMs(topic) });
    },
    [topics, setData, setTimer]
  );

  const addTopic = useCallback(
    (topic) => {
      const t = { id: uid('t'), title: topic.title, durationMinutes: topic.durationMinutes, durationSeconds: topic.durationSeconds };
      setData((d) => ({ ...d, topics: [...d.topics, t], activeTopicId: d.activeTopicId ?? t.id }));
      return t.id;
    },
    [setData]
  );

  const updateTopic = useCallback(
    (id, patch) => setData((d) => ({ ...d, topics: d.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
    [setData]
  );

  const deleteTopic = useCallback(
    (id) =>
      setData((d) => {
        const topicsLeft = d.topics.filter((t) => t.id !== id);
        const { [id]: _removed, ...spoken } = d.spoken || {};
        return {
          ...d,
          topics: topicsLeft,
          spoken,
          activeTopicId: d.activeTopicId === id ? topicsLeft[0]?.id ?? null : d.activeTopicId,
        };
      }),
    [setData]
  );

  const moveTopic = useCallback(
    (id, dir) =>
      setData((d) => {
        const list = [...d.topics];
        const i = list.findIndex((t) => t.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return d;
        [list[i], list[j]] = [list[j], list[i]];
        return { ...d, topics: list };
      }),
    [setData]
  );

  const resetRound = useCallback(() => {
    if (!activeTopic) return;
    setData((d) => ({ ...d, spoken: { ...d.spoken, [activeTopic.id]: [] }, currentCandidateId: enabledCandidates[0]?.id ?? null }));
    setTimer({ ...IDLE, remainingMs: totalMs });
  }, [activeTopic, enabledCandidates, setData, setTimer, totalMs]);

  // ---------- Candidatos ----------
  const addCandidate = useCallback(
    (c) => setData((d) => ({ ...d, candidates: [...d.candidates, { ...c, id: uid('c'), enabled: true }] })),
    [setData]
  );
  const updateCandidate = useCallback(
    (id, patch) => setData((d) => ({ ...d, candidates: d.candidates.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
    [setData]
  );
  const deleteCandidate = useCallback(
    (id) => setData((d) => ({ ...d, candidates: d.candidates.filter((c) => c.id !== id) })),
    [setData]
  );
  const toggleCandidate = useCallback(
    (id) => setData((d) => ({ ...d, candidates: d.candidates.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)) })),
    [setData]
  );
  const reorderCandidates = useCallback((list) => setData((d) => ({ ...d, candidates: list })), [setData]);
  const moveCandidate = useCallback(
    (id, dir) =>
      setData((d) => {
        const list = [...d.candidates];
        const i = list.findIndex((c) => c.id === id);
        const j = i + dir;
        if (i < 0 || j < 0 || j >= list.length) return d;
        [list[i], list[j]] = [list[j], list[i]];
        return { ...d, candidates: list };
      }),
    [setData]
  );

  // ---------- Configuración general / importación ----------
  const updateConfig = useCallback(
    (patch) => setData((d) => ({ ...d, debateConfig: { ...d.debateConfig, ...patch } })),
    [setData]
  );

  const exportData = useCallback(() => {
    const payload = {
      app: 'XEKRAM Debate Control',
      version: 1,
      exportedAt: new Date().toISOString(),
      debateConfig: data.debateConfig,
      topics: data.topics,
      candidates: data.candidates,
      activeTopicId: data.activeTopicId,
      currentCandidateId: data.currentCandidateId,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = data.debateConfig.title.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    a.href = url;
    a.download = `${slug || 'debate'}-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }, [data]);

  const importData = useCallback(
    (raw) => {
      if (!raw || typeof raw !== 'object' || (!Array.isArray(raw.topics) && !Array.isArray(raw.candidates))) {
        throw new Error('El archivo no contiene "topics" ni "candidates". Revisa que sea una exportación de esta aplicación.');
      }
      const normalized = normalizeData(raw);
      setData(normalized);
      const topic = normalized.topics.find((t) => t.id === normalized.activeTopicId);
      setTimer({ ...IDLE, remainingMs: topicDurationMs(topic) });
      return normalized;
    },
    [setData, setTimer]
  );

  const restoreDefaults = useCallback(() => {
    const d = normalizeData(DEFAULT_DATA);
    setData(d);
    setTimer({ ...IDLE, remainingMs: topicDurationMs(d.topics[0]) });
  }, [setData, setTimer]);

  const setView = useCallback((view) => setPrefs((p) => ({ ...p, view })), [setPrefs]);
  const toggleMute = useCallback(() => setPrefs((p) => ({ ...p, muted: !p.muted })), [setPrefs]);

  const value = {
    // estado
    config, topics, candidates, activeTopic, enabledCandidates, currentCandidate, currentIndex,
    nextCandidate, spokenIds, timer, totalMs, remainingMs, countdownValue, showGo, prefs,
    // cronómetro
    start, pause, resume, reset, toggle, next, previous, selectCandidate,
    // temas
    selectTopic, addTopic, updateTopic, deleteTopic, moveTopic, resetRound,
    // candidatos
    addCandidate, updateCandidate, deleteCandidate, toggleCandidate, reorderCandidates, moveCandidate,
    // general
    updateConfig, exportData, importData, restoreDefaults, setView, toggleMute, play,
  };

  return <DebateContext.Provider value={value}>{children}</DebateContext.Provider>;
}

export function useDebate() {
  const ctx = useContext(DebateContext);
  if (!ctx) throw new Error('useDebate debe usarse dentro de <DebateProvider>');
  return ctx;
}
