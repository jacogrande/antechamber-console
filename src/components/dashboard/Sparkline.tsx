interface SparklineProps {
  data: number[]
  width?: number | string
  height?: number
  color?: string
  showFill?: boolean
  showEndDot?: boolean
}

// Convert points to a smooth cubic bezier path using Catmull-Rom spline
function smoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return ''
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
  }

  let path = `M ${points[0].x} ${points[0].y}`

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]

    // Catmull-Rom to Cubic Bezier conversion
    const tension = 6 // Higher = smoother curves
    const cp1x = p1.x + (p2.x - p0.x) / tension
    const cp1y = p1.y + (p2.y - p0.y) / tension
    const cp2x = p2.x - (p3.x - p1.x) / tension
    const cp2y = p2.y - (p3.y - p1.y) / tension

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
  }

  return path
}

export function Sparkline({
  data,
  width = '100%',
  height = 40,
  color,
  showFill = true,
  showEndDot = false,
}: SparklineProps) {
  const lineColor = color ?? 'hsl(var(--primary))'

  if (data.length < 2) {
    return null
  }

  // Normalize data to 0-1 range
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const normalized = data.map((v) => (v - min) / range)

  // Use percentage-based coordinates for proper stretching
  const viewBoxWidth = 100
  const viewBoxHeight = 100
  const padding = 4

  // Generate points as percentages
  const points = normalized.map((value, index) => {
    const x = (index / (data.length - 1)) * (viewBoxWidth - padding * 2) + padding
    const y = (1 - value) * (viewBoxHeight - padding * 2) + padding
    return { x, y }
  })

  // Create smooth line path
  const linePath = smoothPath(points)

  // Create fill path (close the shape at the bottom)
  const fillPath = `${linePath} L ${viewBoxWidth - padding} ${viewBoxHeight} L ${padding} ${viewBoxHeight} Z`

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="none"
      className="block"
    >
      {showFill && (
        <path
          d={fillPath}
          fill={lineColor}
          opacity={0.1}
        />
      )}
      <path
        d={linePath}
        fill="none"
        stroke={lineColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showEndDot && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r={2.5}
          fill={lineColor}
        />
      )}
    </svg>
  )
}
