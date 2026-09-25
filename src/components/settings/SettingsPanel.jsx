import { AlertCircle, CheckCircle2, Download, Keyboard, MonitorPlay, RotateCcw, Settings2, Upload, Volume2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { useDebate } from '../../context/DebateContext';
import { sounds, unlockAudio } from '../../lib/audio';
import { clampInt } from '../../lib/utils';
import ConfirmButton from '../ui/ConfirmButton';
import SectionHeader from '../ui/SectionHeader';
import Switch from '../ui/Switch';

const SHORTCUTS = [
  ['Espacio', 'Iniciar turno con cuenta regresiva, pausar o reanudar'],
  ['Enter', 'Detener y pasar al siguiente candidato'],
  ['R', 'Reiniciar el tiempo del turno actual'],
  ['F', 'Alternar pantalla completa'],
];

const SOUND_TESTS = [
  ['countdown', 'Cuenta regresiva'],
  ['go', 'Comienza'],
  ['warning', 'Alerta'],
  ['critical', 'Crítico'],
  ['timeUp', 'Tiempo agotado'],
  ['turn', 'Cambio de turno'],
];

function NumberField({ id, label, hint, value, min, max, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        className="field font-mono tabular"
        value={value}
        onChange={(e) => onChange(clampInt(e.target.value, min, max, min))}
      />
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

export default function SettingsPanel() {
  const { config, updateConfig, exportData, importData, restoreDefaults, prefs, toggleMute } = useDebate();
  const fileRef = useRef(null);
  const [notice, setNotice] = useState(null);

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text());
      const result = importData(parsed);
      setNotice({ ok: true, text: `Configuración importada: ${result.topics.length} ejes y ${result.candidates.length} candidatos.` });
    } catch (err) {
      setNotice({ ok: false, text: err instanceof SyntaxError ? 'El archivo no es un JSON válido.' : err.message });
    }
  };

  const thresholdsInverted = config.criticalThresholdSeconds >= config.warningThresholdSeconds;

  return (
    <div>
      <SectionHeader
        icon={Settings2}
        title="Ajustes"
        description="Parámetros generales del debate, sonido y respaldo de la configuración."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel space-y-4 p-5">
          <h3 className="font-display text-xl font-bold text-zinc-100">Debate</h3>
          <div>
            <label htmlFor="cfg-title" className="label">Título en pantalla</label>
            <input id="cfg-title" className="field" value={config.title} onChange={(e) => updateConfig({ title: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <NumberField id="cfg-intro" label="Cuenta de entrada (s)" value={config.countdownIntroSeconds} min={0} max={15} onChange={(v) => updateConfig({ countdownIntroSeconds: v })} hint="0 la desactiva" />
            <NumberField id="cfg-warn" label="Alerta ámbar (s)" value={config.warningThresholdSeconds} min={0} max={600} onChange={(v) => updateConfig({ warningThresholdSeconds: v })} />
            <NumberField id="cfg-crit" label="Crítico rojo (s)" value={config.criticalThresholdSeconds} min={0} max={600} onChange={(v) => updateConfig({ criticalThresholdSeconds: v })} />
          </div>
          {thresholdsInverted && (
            <p className="flex items-center gap-2 text-xs text-amber-400">
              <AlertCircle size={14} /> El umbral crítico debería ser menor que el de alerta.
            </p>
          )}
        </section>

        <section className="panel space-y-4 p-5">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-100">
            <Volume2 size={18} /> Sonido
          </h3>
          <div className="flex items-center justify-between rounded-lg border border-studio-line bg-studio-base px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-zinc-200">Alertas sonoras</p>
              <p className="text-xs text-zinc-500">Beeps de cuenta regresiva, alertas y fin de tiempo</p>
            </div>
            <Switch checked={!prefs.muted} onChange={toggleMute} label="Activar o silenciar sonido" />
          </div>
          <div>
            <p className="label">Probar sonidos</p>
            <div className="flex flex-wrap gap-2">
              {SOUND_TESTS.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className="btn-ghost py-1.5 text-xs"
                  onClick={() => {
                    unlockAudio();
                    sounds[key]();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="panel space-y-4 p-5">
          <h3 className="font-display text-xl font-bold text-zinc-100">Respaldo de configuración</h3>
          <p className="text-sm text-zinc-400">
            Todo se guarda automáticamente en este navegador. Exporta un archivo .json para llevar la configuración a otro equipo.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary" onClick={exportData}>
              <Download size={16} /> Exportar .json
            </button>
            <button type="button" className="btn-ghost" onClick={() => fileRef.current?.click()}>
              <Upload size={16} /> Importar .json
            </button>
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
            <ConfirmButton
              className="btn-danger"
              confirmLabel="Confirmar restauración"
              onConfirm={() => {
                restoreDefaults();
                setNotice({ ok: true, text: 'Se restauraron los datos de fábrica de Coya 2026.' });
              }}
            >
              <RotateCcw size={16} /> Restaurar datos de fábrica
            </ConfirmButton>
          </div>
          {notice && (
            <p className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm ${notice.ok ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`} role="status">
              {notice.ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
              {notice.text}
            </p>
          )}
        </section>

        <section className="panel space-y-4 p-5">
          <h3 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-100">
            <Keyboard size={18} /> Atajos de teclado
          </h3>
          <ul className="divide-y divide-studio-line">
            {SHORTCUTS.map(([key, desc]) => (
              <li key={key} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                <span className="text-zinc-300">{desc}</span>
                <span className="kbd">{key}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 rounded-lg border border-sky-500/30 bg-sky-500/5 p-3 text-sm text-zinc-300">
            <MonitorPlay size={18} className="mt-0.5 shrink-0 text-sky-400" />
            <p>
              Para operar desde un monitor y proyectar en otro, abre la aplicación en una segunda ventana del mismo navegador:
              ambas se sincronizan en tiempo real.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
