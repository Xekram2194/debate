export default function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors ${
        checked ? 'border-emerald-500/60 bg-emerald-500/25' : 'border-zinc-700 bg-zinc-800'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full shadow transition-transform ${
          checked ? 'translate-x-[22px] bg-emerald-400' : 'translate-x-1 bg-zinc-500'
        }`}
      />
    </button>
  );
}
