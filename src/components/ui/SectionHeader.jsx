export default function SectionHeader({ icon: Icon, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-lg border border-studio-line bg-studio-raised text-sky-400">
            <Icon size={20} />
          </span>
        )}
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight text-zinc-50">{title}</h2>
          {description && <p className="mt-1 max-w-2xl text-sm text-zinc-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
