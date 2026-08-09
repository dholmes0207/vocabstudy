// Labelled field + segmented button, shared by the session setup screens
// (Quiz, Speaking). Presentational only.

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-500">{label}</p>
      {children}
    </div>
  )
}

export function Segment({
  active,
  onClick,
  disabled,
  children,
}: {
  active: boolean
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
        active
          ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-200'
          : 'border-slate-200 hover:border-brand-300 dark:border-slate-700'
      }`}
    >
      {children}
    </button>
  )
}
