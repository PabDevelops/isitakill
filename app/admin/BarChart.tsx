interface BarChartProps {
  title: string
  data: { label: string; value: number }[]
  color?: string
  formatValue?: (v: number) => string
}

export default function BarChart({
  title,
  data,
  color = '#facc15',
  formatValue = (v) => String(v),
}: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const width = 600
  const height = 160
  const barGap = 4
  const barWidth = data.length > 0 ? width / data.length - barGap : 0

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-5">
      <p className="text-zinc-400 text-sm font-medium mb-4">{title}</p>
      <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-auto overflow-visible">
        {data.map((d, i) => {
          const barHeight = (d.value / max) * height
          const x = i * (barWidth + barGap)
          const y = height - barHeight
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={Math.max(barWidth, 1)}
                height={Math.max(barHeight, 1)}
                fill={color}
                opacity={0.85}
                rx={2}
              />
              {i % Math.ceil(data.length / 8 || 1) === 0 && (
                <text
                  x={x + barWidth / 2}
                  y={height + 14}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#71717a"
                >
                  {d.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <p className="text-zinc-600 text-xs mt-1">
        Total: {formatValue(data.reduce((sum, d) => sum + d.value, 0))}
      </p>
    </div>
  )
}
