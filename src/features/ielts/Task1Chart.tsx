import { axisMax, type Task1Chart as Chart } from '@/lib/ielts'

// A small line or bar chart drawn from Task 1 data, in SVG so it is crisp on
// any screen and needs no chart library. The numbers are in a table for
// screen readers.

const COLORS = ['#0ea5e9', '#f43f5e', '#f59e0b', '#10b981']
const W = 320
const H = 200
const PAD = { l: 34, r: 8, t: 10, b: 26 }

export default function Task1Chart({ chart }: { chart: Chart }) {
  const top = axisMax(Math.max(...chart.series.flatMap((s) => s.values)))
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const y = (v: number) => PAD.t + ih - (v / top) * ih
  const n = chart.labels.length
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(top * f))
  const slot = iw / n

  return (
    <figure className="space-y-2">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full text-slate-400 dark:text-slate-500"
        role="img"
        aria-label={chart.title[1]}
      >
        {ticks.map((v) => (
          <g key={v}>
            <line
              x1={PAD.l}
              x2={W - PAD.r}
              y1={y(v)}
              y2={y(v)}
              stroke="currentColor"
              strokeOpacity={0.3}
              strokeWidth={0.5}
            />
            <text x={PAD.l - 4} y={y(v) + 3} fontSize={8} textAnchor="end" fill="currentColor">
              {v}
            </text>
          </g>
        ))}
        {chart.labels.map((l, i) => (
          <text
            key={l}
            x={PAD.l + slot * i + slot / 2}
            y={H - PAD.b + 12}
            fontSize={8}
            textAnchor="middle"
            fill="currentColor"
          >
            {l}
          </text>
        ))}
        {chart.kind === 'line'
          ? chart.series.map((s, k) => (
              <g key={s.name}>
                <polyline
                  fill="none"
                  stroke={COLORS[k % COLORS.length]}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  points={s.values
                    .map((v, i) => `${PAD.l + slot * i + slot / 2},${y(v)}`)
                    .join(' ')}
                />
                {s.values.map((v, i) => (
                  <circle
                    key={i}
                    cx={PAD.l + slot * i + slot / 2}
                    cy={y(v)}
                    r={2.5}
                    fill={COLORS[k % COLORS.length]}
                  />
                ))}
              </g>
            ))
          : chart.labels.map((l, i) => {
              const bw = (slot * 0.7) / chart.series.length
              return chart.series.map((s, k) => {
                const v = s.values[i]
                return (
                  <rect
                    key={`${l}-${s.name}`}
                    x={PAD.l + slot * i + slot * 0.15 + bw * k}
                    y={y(v)}
                    width={bw - 1}
                    height={PAD.t + ih - y(v)}
                    rx={1.5}
                    fill={COLORS[k % COLORS.length]}
                  />
                )
              })
            })}
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-3 text-xs" lang="en">
        {chart.series.map((s, k) => (
          <span key={s.name} className="flex items-center gap-1">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: COLORS[k % COLORS.length] }}
              aria-hidden="true"
            />
            {s.name}
          </span>
        ))}
        <span className="text-slate-500 dark:text-slate-400">({chart.unit})</span>
      </figcaption>
      {/* sr-only goes on a wrapper: a table ignores width: 1px and would keep
          its full width, widening the page on a phone. */}
      <div className="sr-only">
        <table lang="en">
          <caption>{chart.title[1]}</caption>
          <thead>
            <tr>
              <th scope="col" />
              {chart.labels.map((l) => (
                <th key={l} scope="col">
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {chart.series.map((s) => (
              <tr key={s.name}>
                <th scope="row">{s.name}</th>
                {s.values.map((v, i) => (
                  <td key={i}>
                    {v} {chart.unit}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}
