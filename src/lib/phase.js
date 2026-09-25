/** Semáforo cromático del cronómetro. */
export const PHASES = {
  normal: { key: 'normal', label: 'Exposición normal', color: '#34d399', text: 'text-emerald-400' },
  warning: { key: 'warning', label: 'Redondee sus ideas', color: '#fbbf24', text: 'text-amber-400' },
  critical: { key: 'critical', label: 'Tiempo crítico', color: '#ef4444', text: 'text-red-500' },
  over: { key: 'over', label: 'TIEMPO AGOTADO', color: '#ef4444', text: 'text-red-500' },
};

export function getPhase(remainingMs, config) {
  const sec = Math.ceil(Math.max(0, remainingMs) / 1000);
  if (sec <= 0) return PHASES.over;
  if (sec <= config.criticalThresholdSeconds) return PHASES.critical;
  if (sec <= config.warningThresholdSeconds) return PHASES.warning;
  return PHASES.normal;
}
