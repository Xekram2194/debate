import { DEFAULT_DATA } from '../data/defaultData';

export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const clampInt = (value, min, max, fallback) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

export const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
export const isValidHex = (hex) => HEX_RE.test(String(hex || '').trim());

export function expandHex(hex) {
  const h = String(hex).trim().replace('#', '');
  return h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
}

export function hexToRgba(hex, alpha = 1) {
  if (!isValidHex(hex)) return `rgba(113,113,122,${alpha})`;
  const h = expandHex(hex);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

export const topicDurationMs = (topic) =>
  ((Number(topic?.durationMinutes) || 0) * 60 + (Number(topic?.durationSeconds) || 0)) * 1000;

/** Formatea milisegundos restantes como MM:SS (redondeando hacia arriba). */
export function formatClock(ms) {
  const total = Math.max(0, Math.ceil((ms || 0) / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export const formatDuration = (min, sec) =>
  `${String(Number(min) || 0).padStart(2, '0')}:${String(Number(sec) || 0).padStart(2, '0')}`;

/** Limpia URLs que vengan en formato markdown: [url](url) → url */
export function cleanUrl(raw) {
  const s = String(raw || '').trim();
  const md = s.match(/\((https?:\/\/[^)\s]+)\)/);
  if (md) return md[1];
  return s.replace(/^\[|\]$/g, '').trim();
}

/**
 * Normaliza cualquier objeto (localStorage o .json importado) al esquema
 * interno de la aplicación, rellenando valores faltantes con los de fábrica.
 */
export function normalizeData(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const defCfg = DEFAULT_DATA.debateConfig;
  const cfg = src.debateConfig || src.config || {};

  const debateConfig = {
    title: typeof cfg.title === 'string' && cfg.title.trim() ? cfg.title : defCfg.title,
    countdownIntroSeconds: clampInt(cfg.countdownIntroSeconds, 0, 15, defCfg.countdownIntroSeconds),
    warningThresholdSeconds: clampInt(cfg.warningThresholdSeconds, 0, 600, defCfg.warningThresholdSeconds),
    criticalThresholdSeconds: clampInt(cfg.criticalThresholdSeconds, 0, 600, defCfg.criticalThresholdSeconds),
  };

  const topicsSrc = Array.isArray(src.topics) ? src.topics : DEFAULT_DATA.topics;
  const seenT = new Set();
  const topics = topicsSrc.filter(Boolean).map((t) => {
    let id = String(t.id || uid('t'));
    if (seenT.has(id)) id = uid('t');
    seenT.add(id);
    return {
      id,
      title: String(t.title || 'Tema sin título'),
      durationMinutes: clampInt(t.durationMinutes, 0, 99, 0),
      durationSeconds: clampInt(t.durationSeconds, 0, 59, 0),
    };
  });

  const candSrc = Array.isArray(src.candidates) ? src.candidates : DEFAULT_DATA.candidates;
  const seenC = new Set();
  const candidates = candSrc.filter(Boolean).map((c) => {
    let id = String(c.id || uid('c'));
    if (seenC.has(id)) id = uid('c');
    seenC.add(id);
    return {
      id,
      name: String(c.name || 'Candidato sin nombre'),
      party: String(c.party || ''),
      color: isValidHex(c.color) ? String(c.color).trim() : '#64748b',
      avatar: cleanUrl(c.avatar),
      enabled: c.enabled !== false,
    };
  });

  const activeTopicId = topics.some((t) => t.id === src.activeTopicId)
    ? src.activeTopicId
    : topics[0]?.id ?? null;

  const enabled = candidates.filter((c) => c.enabled);
  const currentCandidateId = enabled.some((c) => c.id === src.currentCandidateId)
    ? src.currentCandidateId
    : enabled[0]?.id ?? null;

  const spoken = {};
  if (src.spoken && typeof src.spoken === 'object') {
    for (const [k, v] of Object.entries(src.spoken)) {
      if (Array.isArray(v)) spoken[k] = v.filter((id) => seenC.has(id));
    }
  }

  return { debateConfig, topics, candidates, activeTopicId, currentCandidateId, spoken };
}
