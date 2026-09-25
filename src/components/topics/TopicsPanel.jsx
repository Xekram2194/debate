import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, ArrowUp, Check, CirclePlay, ListOrdered, Pencil, Plus, Timer, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useDebate } from '../../context/DebateContext';
import { clampInt, formatClock, formatDuration, topicDurationMs } from '../../lib/utils';
import ConfirmButton from '../ui/ConfirmButton';
import SectionHeader from '../ui/SectionHeader';

const EMPTY = { title: '', durationMinutes: 2, durationSeconds: 0 };

function DurationInputs({ value, onChange, idPrefix }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20">
        <label htmlFor={`${idPrefix}-min`} className="label">Minutos</label>
        <input
          id={`${idPrefix}-min`}
          type="number"
          min={0}
          max={99}
          className="field font-mono tabular"
          value={value.durationMinutes}
          onChange={(e) => onChange({ ...value, durationMinutes: clampInt(e.target.value, 0, 99, 0) })}
        />
      </div>
      <span className="mt-6 font-mono text-xl text-zinc-600">:</span>
      <div className="w-20">
        <label htmlFor={`${idPrefix}-sec`} className="label">Segundos</label>
        <input
          id={`${idPrefix}-sec`}
          type="number"
          min={0}
          max={59}
          className="field font-mono tabular"
          value={value.durationSeconds}
          onChange={(e) => onChange({ ...value, durationSeconds: clampInt(e.target.value, 0, 59, 0) })}
        />
      </div>
    </div>
  );
}

function TopicRow({ topic, index, total }) {
  const { activeTopic, selectTopic, updateTopic, deleteTopic, moveTopic, timer } = useDebate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(topic);
  const isActive = activeTopic?.id === topic.id;
  const locked = timer.status === 'running' || timer.status === 'countdown';
  const draftValid = draft.title.trim() && topicDurationMs(draft) > 0;

  const save = () => {
    if (!draftValid) return;
    updateTopic(topic.id, { ...draft, title: draft.title.trim() });
    setEditing(false);
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`rounded-xl border p-4 transition-colors ${
        isActive ? 'border-sky-500/60 bg-sky-500/[0.06]' : 'border-studio-line bg-studio-panel'
      }`}
    >
      {editing ? (
        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <div className="min-w-[14rem] flex-1">
            <label htmlFor={`edit-${topic.id}`} className="label">Título del eje</label>
            <input
              id={`edit-${topic.id}`}
              className="field"
              value={draft.title}
              autoFocus
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </div>
          <DurationInputs value={draft} onChange={setDraft} idPrefix={`edit-${topic.id}`} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={!draftValid}>
              <Check size={16} /> Guardar
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setDraft(topic);
                setEditing(false);
              }}
            >
              <X size={16} /> Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-studio-line bg-studio-base font-mono text-sm font-bold tabular text-zinc-400">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-xl font-bold leading-tight text-zinc-50">{topic.title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-zinc-400">
              <Timer size={14} /> Intervención de
              <span className="font-mono font-bold tabular text-zinc-200">
                {formatDuration(topic.durationMinutes, topic.durationSeconds)}
              </span>
              por candidato
            </p>
          </div>

          {isActive ? (
            <span className="inline-flex items-center gap-1.5 rounded-md bg-sky-500/15 px-2.5 py-1 text-xs font-bold text-sky-300">
              <CirclePlay size={14} /> En curso
            </span>
          ) : (
            <button
              type="button"
              className="btn-ghost py-1.5 text-xs"
              onClick={() => selectTopic(topic.id)}
              disabled={locked}
              title={locked ? 'Detén el turno para cambiar de eje' : undefined}
            >
              <CirclePlay size={14} /> Poner en curso
            </button>
          )}

          <div className="flex items-center gap-0.5">
            <button type="button" className="icon-btn" onClick={() => moveTopic(topic.id, -1)} disabled={index === 0} aria-label="Subir">
              <ArrowUp size={16} />
            </button>
            <button type="button" className="icon-btn" onClick={() => moveTopic(topic.id, 1)} disabled={index === total - 1} aria-label="Bajar">
              <ArrowDown size={16} />
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setDraft(topic);
                setEditing(true);
              }}
              aria-label="Editar"
              title="Editar"
            >
              <Pencil size={16} />
            </button>
            <ConfirmButton
              onConfirm={() => deleteTopic(topic.id)}
              className="icon-btn hover:!text-red-400"
              title="Eliminar"
              aria-label="Eliminar eje"
              disabled={isActive && locked}
            >
              <Trash2 size={16} />
            </ConfirmButton>
          </div>
        </div>
      )}
    </motion.li>
  );
}

export default function TopicsPanel() {
  const { topics, addTopic, enabledCandidates } = useDebate();
  const [form, setForm] = useState(EMPTY);
  const valid = form.title.trim() && topicDurationMs(form) > 0;

  const totalDebateMs = topics.reduce((acc, t) => acc + topicDurationMs(t), 0) * enabledCandidates.length;

  return (
    <div>
      <SectionHeader
        icon={ListOrdered}
        title="Ejes temáticos"
        description="Define los temas del debate y cuánto dura cada intervención. El eje marcado como en curso es el que usa el cronómetro de la sala en vivo."
        actions={
          <div className="rounded-lg border border-studio-line bg-studio-panel px-4 py-2 text-right">
            <p className="text-xs text-zinc-500">Duración estimada del debate</p>
            <p className="font-mono text-lg font-bold tabular text-zinc-100">
              {formatClock(totalDebateMs)} <span className="text-xs font-normal text-zinc-500">({enabledCandidates.length} candidatos)</span>
            </p>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[22rem_1fr]">
        <form
          className="panel h-fit space-y-4 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            addTopic({ ...form, title: form.title.trim() });
            setForm(EMPTY);
          }}
        >
          <h3 className="font-display text-xl font-bold text-zinc-100">Nuevo eje temático</h3>
          <div>
            <label htmlFor="new-topic" className="label">Título</label>
            <input
              id="new-topic"
              className="field"
              placeholder="Ej. Medio ambiente y gestión del agua"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <DurationInputs value={form} onChange={setForm} idPrefix="new" />
          <button type="submit" className="btn-primary w-full" disabled={!valid}>
            <Plus size={16} /> Añadir eje
          </button>
          {!valid && form.title && topicDurationMs(form) === 0 && (
            <p className="text-xs text-amber-400">La duración debe ser mayor a 00:00.</p>
          )}
        </form>

        <ul className="space-y-3">
          <AnimatePresence initial={false}>
            {topics.map((t, i) => (
              <TopicRow key={t.id} topic={t} index={i} total={topics.length} />
            ))}
          </AnimatePresence>
          {topics.length === 0 && (
            <li className="panel p-8 text-center text-sm text-zinc-400">
              Aún no hay ejes. Añade el primero con el formulario para habilitar el cronómetro.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
