interface Props {
  emoji?: string
  title: string
  description?: string
  children?: React.ReactNode
}

export default function EmptyState({ emoji = '✨', title, description, children }: Props) {
  return (
    <div className="mx-auto max-w-md animate-fade-in py-8 text-center">
      <div className="card p-8">
        <p className="text-5xl">{emoji}</p>
        <h2 className="mt-4 text-xl font-bold">{title}</h2>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        {children && <div className="mt-6 flex flex-wrap justify-center gap-3">{children}</div>}
      </div>
    </div>
  )
}
