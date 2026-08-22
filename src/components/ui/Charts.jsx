import { useId } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

/*
 * Hand-rolled inline-SVG charts.
 *
 * The project has no charting dependency and does not need one: these three
 * shapes (trend line, comparison bars, composition ring) cover every dashboard
 * visual, render at any size, inherit theme colours, and add nothing to the
 * bundle.
 */

// Resolve a palette token name ("primary", "success") or a raw CSS colour.
function useColor(color) {
  const theme = useTheme()
  if (!color) return theme.palette.primary.main
  const entry = theme.palette[color]
  if (entry && typeof entry === 'object' && entry.main) return entry.main
  return color
}

/** Smooth-ish trend line with a soft area fill. */
export function Sparkline({ values = [], color = 'primary', height = 56, showArea = true, strokeWidth = 2 }) {
  const stroke = useColor(color)
  const gradientId = useId().replace(/:/g, '')
  const width = 100
  const points = values.length ? values : [0, 0]
  const max = Math.max(...points, 1)
  const min = Math.min(...points, 0)
  const span = max - min || 1
  const step = points.length > 1 ? width / (points.length - 1) : width

  const coords = points.map((value, index) => {
    const x = index * step
    const y = 4 + (1 - (value - min) / span) * (28 - 4)
    return [Number(x.toFixed(2)), Number(y.toFixed(2))]
  })
  const line = coords.map(([x, y]) => `${x},${y}`).join(' ')
  const area = `${line} ${width},32 0,32`

  return (
    <Box sx={{ width: '100%', height, lineHeight: 0 }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} 32`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {showArea && (
          <>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={area} fill={`url(#${gradientId})`} />
          </>
        )}
        <polyline
          points={line}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </Box>
  )
}

/**
 * Vertical comparison bars with axis labels.
 * data: [{ label, value, color?, hint? }]
 */
export function BarSeries({ data = [], height = 148, color = 'primary', valueFormatter }) {
  const base = useColor(color)
  const theme = useTheme()
  const max = Math.max(...data.map((d) => d.value || 0), 1)
  const format = valueFormatter || ((v) => v)

  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 0.75, sm: 1.25 }, height, width: '100%' }}>
      {data.map((item, index) => {
        const ratio = (item.value || 0) / max
        const isPeak = (item.value || 0) === max && max > 0
        return (
          <Box
            key={`${item.label}-${index}`}
            sx={{
              flex: 1,
              minWidth: 0,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: 0.75,
            }}
            title={`${item.label}: ${format(item.value || 0)}`}
          >
            <Typography
              className="tnum"
              variant="caption"
              sx={{
                fontWeight: 650,
                fontSize: '0.6875rem',
                color: isPeak ? 'text.primary' : 'text.secondary',
                lineHeight: 1,
              }}
            >
              {format(item.value || 0)}
            </Typography>
            <Box
              sx={{
                width: '100%',
                maxWidth: 44,
                flexGrow: 1,
                display: 'flex',
                alignItems: 'flex-end',
                bgcolor: theme.palette.mode === 'light' ? 'background.sunken' : 'background.elevated',
                borderRadius: 1.5,
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: `${Math.max(ratio * 100, item.value ? 5 : 1.5)}%`,
                  bgcolor: item.color ? `${item.color}.main` : base,
                  opacity: isPeak ? 1 : 0.62,
                  borderRadius: 1.5,
                  transition: 'height 420ms cubic-bezier(0.32, 0.72, 0, 1)',
                }}
              />
            </Box>
            <Typography
              variant="caption"
              noWrap
              sx={{ color: 'text.disabled', fontSize: '0.625rem', maxWidth: '100%' }}
            >
              {item.label}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

/**
 * Composition ring.
 * segments: [{ label, value, color }] — color is a palette token name.
 */
export function DonutChart({
  segments = [],
  size = 152,
  thickness = 14,
  centerValue,
  centerLabel,
}) {
  const theme = useTheme()
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const track = theme.palette.mode === 'light' ? theme.palette.neutral[100] : theme.palette.background.elevated

  let offset = 0

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} aria-hidden="true" focusable="false">
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={track}
            strokeWidth={thickness}
          />
          {total > 0 &&
            segments.map((segment, index) => {
              const fraction = (segment.value || 0) / total
              const length = fraction * circumference
              const dash = `${length} ${circumference - length}`
              const element = (
                <circle
                  key={`${segment.label}-${index}`}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={theme.palette[segment.color]?.main || segment.color}
                  strokeWidth={thickness}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap={fraction > 0.02 && fraction < 0.98 ? 'butt' : 'round'}
                />
              )
              offset += length
              return element
            })}
        </g>
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 2,
        }}
      >
        <Typography
          className="tnum"
          variant="h5"
          component="div"
          sx={{ fontWeight: 700, lineHeight: 1.1 }}
        >
          {centerValue ?? total}
        </Typography>
        {centerLabel && (
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
            {centerLabel}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

/** Legend rows for a DonutChart or StackedBar. */
export function ChartLegend({ segments = [], total, valueFormatter }) {
  const sum = total ?? segments.reduce((acc, s) => acc + (s.value || 0), 0)
  const format = valueFormatter || ((v) => v)
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, minWidth: 0, flexGrow: 1 }}>
      {segments.map((segment, index) => (
        <Box key={`${segment.label}-${index}`} sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '2px',
              flexShrink: 0,
              bgcolor: `${segment.color}.main`,
            }}
          />
          <Typography variant="body2" sx={{ minWidth: 0, flexGrow: 1 }} noWrap>
            {segment.label}
          </Typography>
          <Typography className="tnum" variant="body2" sx={{ fontWeight: 650 }}>
            {format(segment.value || 0)}
          </Typography>
          <Typography
            className="tnum"
            variant="caption"
            sx={{ color: 'text.disabled', width: 38, textAlign: 'right' }}
          >
            {sum > 0 ? `${Math.round(((segment.value || 0) / sum) * 100)}%` : '0%'}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

/** One horizontal bar split proportionally between segments. */
export function StackedBar({ segments = [], height = 8, radius = 99 }) {
  const total = segments.reduce((sum, s) => sum + (s.value || 0), 0)
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height,
        borderRadius: radius,
        overflow: 'hidden',
        bgcolor: (t) => (t.palette.mode === 'light' ? 'neutral.100' : 'background.elevated'),
      }}
    >
      {total > 0 &&
        segments.map((segment, index) => (
          <Box
            key={`${segment.label}-${index}`}
            title={`${segment.label}: ${segment.value}`}
            sx={{
              width: `${((segment.value || 0) / total) * 100}%`,
              bgcolor: `${segment.color}.main`,
              transition: 'width 420ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          />
        ))}
    </Box>
  )
}

/** Label + value + progress bar, for capacity-style metrics. */
export function ProgressMeter({ label, value = 0, max = 100, color = 'primary', hint, valueLabel }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
        <Typography variant="body2" sx={{ fontWeight: 550, minWidth: 0 }} noWrap>
          {label}
        </Typography>
        <Typography className="tnum" variant="body2" sx={{ fontWeight: 650, flexShrink: 0 }}>
          {valueLabel ?? `${Math.round(pct)}%`}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 6,
          borderRadius: 99,
          bgcolor: (t) => (t.palette.mode === 'light' ? 'neutral.100' : 'background.elevated'),
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 99,
            bgcolor: `${color}.main`,
            transition: 'width 420ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        />
      </Box>
      {hint && (
        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
          {hint}
        </Typography>
      )}
    </Box>
  )
}
