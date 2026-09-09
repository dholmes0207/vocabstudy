import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

// A single unhandled render error used to take the whole app down: React
// unmounts the tree, the learner gets a blank white page, and the only way out
// is knowing to reload. This catches it, explains it in plain Vietnamese, and
// offers a way back.

interface Props {
  children: ReactNode
  /** Called with the caught error — hook for logging/telemetry. */
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info)
  }

  private retry = (): void => {
    this.setState({ error: null })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div role="alert" className="grid min-h-[60vh] place-items-center p-6 text-center">
        <div className="card max-w-md p-8">
          <p className="text-4xl">😥</p>
          <h1 className="mt-3 text-lg font-bold">Có lỗi xảy ra ở màn hình này</h1>
          <p className="mt-2 text-sm text-slate-500">
            Tiến độ học của bạn vẫn được giữ nguyên. Bấm thử lại, hoặc tải lại trang nếu vẫn chưa
            được.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button className="btn-primary" onClick={this.retry}>
              <RefreshCw className="h-4 w-4" /> Thử lại
            </button>
            <button className="btn-secondary" onClick={() => location.reload()}>
              Tải lại trang
            </button>
          </div>
          {import.meta.env.DEV && (
            <pre className="mt-4 overflow-x-auto rounded-lg bg-slate-100 p-3 text-left text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {error.message}
            </pre>
          )}
        </div>
      </div>
    )
  }
}
