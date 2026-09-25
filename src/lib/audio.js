// Motor de sonido con Web Audio API nativa (sin dependencias).
let ctx = null;

function getCtx() {
  if (typeof window === 'undefined') return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

/** Los navegadores exigen un gesto del usuario antes de reproducir audio. */
export function unlockAudio() {
  getCtx();
}

function tone({ freq = 880, duration = 0.12, type = 'sine', volume = 0.2, delay = 0 }) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + delay;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.setValueAtTime(volume, t0 + Math.max(0.01, duration - 0.05));
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(gain).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sounds = {
  /** Beep corto de la cuenta regresiva 5..1 */
  countdown: () => tone({ freq: 880, duration: 0.12, type: 'square', volume: 0.12 }),
  /** ¡COMIENZA! */
  go: () => {
    tone({ freq: 1320, duration: 0.45, type: 'square', volume: 0.14 });
    tone({ freq: 660, duration: 0.45, type: 'sine', volume: 0.12 });
  },
  /** Aviso de redondeo: doble beep */
  warning: () => {
    tone({ freq: 740, duration: 0.14, type: 'triangle', volume: 0.25 });
    tone({ freq: 740, duration: 0.14, type: 'triangle', volume: 0.25, delay: 0.2 });
  },
  /** Tic de tiempo crítico */
  critical: () => tone({ freq: 1040, duration: 0.07, type: 'square', volume: 0.1 }),
  /** Pitido final prolongado */
  timeUp: () => {
    tone({ freq: 440, duration: 1.9, type: 'square', volume: 0.14 });
    tone({ freq: 880, duration: 1.9, type: 'sine', volume: 0.1 });
  },
  /** Cambio de turno: dos tonos ascendentes */
  turn: () => {
    tone({ freq: 523, duration: 0.12, type: 'sine', volume: 0.22 });
    tone({ freq: 784, duration: 0.2, type: 'sine', volume: 0.22, delay: 0.13 });
  },
};
