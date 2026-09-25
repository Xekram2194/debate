import { Reorder, useDragControls } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, GripVertical, Pencil, Plus, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useState } from 'react';
import { useDebate } from '../../context/DebateContext';
import { cleanUrl, hexToRgba, isValidHex } from '../../lib/utils';
import Avatar from '../ui/Avatar';
import ConfirmButton from '../ui/ConfirmButton';
import SectionHeader from '../ui/SectionHeader';
import Switch from '../ui/Switch';

const EMPTY = { name: '', party: '', color: '#0ea5e9', avatar: '' };
const SWATCHES = ['#0ea5e9', '#16a34a', '#dc2626', '#9333ea', '#ea580c', '#2563eb', '#059669', '#b91c1c', '#eab308', '#db2777'];

function CandidateForm({ editing, onDone }) {
  const { addCandidate, updateCandidate } = useDebate();
  const [form, setForm] = useState(editing ? { ...editing } : EMPTY);
  const hexOk = isValidHex(form.color);
  const valid = form.name.trim() && hexOk;

  const submit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const payload = {
      name: form.name.trim(),
      party: form.party.trim(),
      color: form.color.trim(),
      avatar: cleanUrl(form.avatar),
    };
    if (editing) updateCandidate(editing.id, payload);
    else addCandidate(payload);
    setForm(EMPTY);
    onDone?.();
  };

  const preview = { ...form, color: hexOk ? form.color : '#64748b', name: form.name || 'Nombre del candidato' };

  return (
    <form onSubmit={submit} className="panel h-fit space-y-4 p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-xl font-bold text-zinc-100">{editing ? 'Editar candidato' : 'Nuevo candidato'}</h3>
        {editing && (
          <button type="button" className="icon-btn" onClick={onDone} aria-label="Cancelar edición">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Vista previa en vivo */}
      <div
        className="flex items-center gap-3 rounded-xl border p-3"
        style={{ borderColor: hexToRgba(preview.color, 0.7), background: `linear-gradient(90deg, ${hexToRgba(preview.color, 0.15)}, transparent)` }}
      >
        <Avatar candidate={preview} size="md" />
        <div className="min-w-0">
          <p className="truncate font-display text-lg font-bold text-zinc-50">{preview.name}</p>
          <p className="truncate text-sm" style={{ color: preview.color }}>{form.party || 'Partido o agrupación'}</p>
        </div>
      </div>

      <div>
        <label htmlFor="cand-name" className="label">Nombre completo</label>
        <input id="cand-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej. María Quispe Huamán" />
      </div>
      <div>
        <label htmlFor="cand-party" className="label">Partido o agrupación</label>
        <input id="cand-party" className="field" value={form.party} onChange={(e) => setForm({ ...form, party: e.target.value })} placeholder="Ej. Movimiento Regional" />
      </div>
      <div>
        <label htmlFor="cand-color" className="label">Color distintivo (HEX)</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            aria-label="Selector de color"
            value={hexOk && form.color.length === 7 ? form.color : '#000000'}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="h-10 w-12 cursor-pointer rounded-lg border border-studio-line bg-studio-base p-1"
          />
          <input
            id="cand-color"
            className={`field font-mono uppercase ${hexOk ? '' : '!border-red-500/70'}`}
            value={form.color}
            maxLength={7}
            onChange={(e) => {
              const v = e.target.value.trim();
              setForm({ ...form, color: v.startsWith('#') ? v : `#${v}` });
            }}
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SWATCHES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm({ ...form, color: s })}
              className={`h-6 w-6 rounded-md ring-offset-2 ring-offset-studio-panel transition ${form.color === s ? 'ring-2 ring-zinc-200' : ''}`}
              style={{ background: s }}
              aria-label={`Usar color ${s}`}
            />
          ))}
        </div>
        {!hexOk && <p className="mt-1 text-xs text-red-400">Usa un color HEX válido, por ejemplo #16a34a.</p>}
      </div>
      <div>
        <label htmlFor="cand-avatar" className="label">URL de foto o avatar (opcional)</label>
        <input id="cand-avatar" className="field" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} placeholder="https://…/foto.jpg" />
        <p className="mt-1 text-xs text-zinc-500">Si la imagen no carga se muestran las iniciales en el color del candidato.</p>
      </div>

      <button type="submit" className="btn-primary w-full" disabled={!valid}>
        {editing ? <Check size={16} /> : <Plus size={16} />}
        {editing ? 'Guardar cambios' : 'Registrar candidato'}
      </button>
    </form>
  );
}

function CandidateRow({ candidate, index, total, onEdit, isEditing }) {
  const { toggleCandidate, deleteCandidate, moveCandidate, currentCandidate, timer } = useDebate();
  const controls = useDragControls();
  const isCurrentLive = currentCandidate?.id === candidate.id && (timer.status === 'running' || timer.status === 'countdown');

  return (
    <Reorder.Item
      value={candidate}
      dragListener={false}
      dragControls={controls}
      className={`flex items-center gap-3 rounded-xl border bg-studio-panel p-3 ${
        isEditing ? 'border-sky-500/60' : 'border-studio-line'
      } ${candidate.enabled ? '' : 'opacity-60'}`}
      whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.6)', zIndex: 10 }}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-zinc-600 hover:text-zinc-300 active:cursor-grabbing"
        onPointerDown={(e) => controls.start(e)}
        aria-label="Arrastrar para reordenar"
      >
        <GripVertical size={18} />
      </button>
      <span className="w-6 text-right font-mono text-sm font-bold tabular text-zinc-500">{index + 1}</span>
      <span className="h-10 w-1 rounded-full" style={{ background: candidate.color }} />
      <Avatar candidate={candidate} size="md" dimmed={!candidate.enabled} />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-display text-lg font-bold leading-tight ${candidate.enabled ? 'text-zinc-50' : 'text-zinc-400 line-through'}`}>
          {candidate.name}
        </p>
        <p className="truncate text-sm" style={{ color: candidate.enabled ? candidate.color : undefined }}>
          {candidate.party || 'Independiente'}
          {!candidate.enabled && <span className="ml-2 text-xs text-zinc-500">Ausente</span>}
        </p>
      </div>
      <span className="hidden font-mono text-xs uppercase text-zinc-500 md:block">{candidate.color}</span>
      <Switch
        checked={candidate.enabled}
        onChange={() => toggleCandidate(candidate.id)}
        label={candidate.enabled ? 'Marcar como ausente' : 'Habilitar candidato'}
      />
      <div className="flex items-center gap-0.5">
        <button type="button" className="icon-btn" onClick={() => moveCandidate(candidate.id, -1)} disabled={index === 0} aria-label="Subir">
          <ArrowUp size={16} />
        </button>
        <button type="button" className="icon-btn" onClick={() => moveCandidate(candidate.id, 1)} disabled={index === total - 1} aria-label="Bajar">
          <ArrowDown size={16} />
        </button>
        <button type="button" className="icon-btn" onClick={() => onEdit(candidate)} aria-label="Editar" title="Editar">
          <Pencil size={16} />
        </button>
        <ConfirmButton
          onConfirm={() => deleteCandidate(candidate.id)}
          className="icon-btn hover:!text-red-400"
          title={isCurrentLive ? 'No se puede eliminar mientras está en turno' : 'Eliminar'}
          aria-label="Eliminar candidato"
          disabled={isCurrentLive}
        >
          <Trash2 size={16} />
        </ConfirmButton>
      </div>
    </Reorder.Item>
  );
}

export default function CandidatesPanel() {
  const { candidates, enabledCandidates, reorderCandidates } = useDebate();
  const [editing, setEditing] = useState(null);

  return (
    <div>
      <SectionHeader
        icon={Users}
        title="Candidatos"
        description="Registra a los participantes y define el orden de intervención arrastrando las filas. Desactiva el interruptor para marcar a un candidato como ausente: saldrá de la rotación sin perder sus datos."
        actions={
          <span className="rounded-lg border border-studio-line bg-studio-panel px-4 py-2 text-sm text-zinc-300">
            <span className="font-mono font-bold tabular text-emerald-400">{enabledCandidates.length}</span> habilitados de{' '}
            <span className="font-mono font-bold tabular">{candidates.length}</span>
          </span>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <CandidateForm key={editing?.id || 'new'} editing={editing} onDone={() => setEditing(null)} />

        <div>
          {candidates.length === 0 ? (
            <div className="panel flex flex-col items-center gap-3 p-10 text-center text-zinc-400">
              <UserPlus size={28} />
              <p>Registra al primer candidato con el formulario.</p>
            </div>
          ) : (
            <Reorder.Group axis="y" values={candidates} onReorder={reorderCandidates} className="space-y-2">
              {candidates.map((c, i) => (
                <CandidateRow
                  key={c.id}
                  candidate={c}
                  index={i}
                  total={candidates.length}
                  isEditing={editing?.id === c.id}
                  onEdit={(cand) => setEditing(cand)}
                />
              ))}
            </Reorder.Group>
          )}
        </div>
      </div>
    </div>
  );
}
