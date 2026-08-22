import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Skeleton from '@mui/material/Skeleton'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

/*
 * Metric card used across both dashboards.
 *
 * Layout: a tonal icon tile, an uppercase label, then the number at display
 * size in tabular figures so a row of cards keeps its rhythm as values change.
 * `accent` draws a hairline top rule in the metric's colour, which is what makes
 * a row of six cards readable at a glance without six coloured backgrounds.
 */
export default function StatCard({
  icon,
  label,
  value,
  color = 'primary',
  loading = false,
  hint,
  trend,
  accent = true,
  footer,
  onClick,
}) {
  const Icon = icon
  const interactive = Boolean(onClick)

  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: interactive ? 'pointer' : 'default',
        '&:hover': interactive
          ? { borderColor: `${color}.main`, boxShadow: 2 }
          : { borderColor: (t) => (t.palette.mode === 'light' ? 'neutral.300' : 'rgba(199,199,212,0.24)') },
        ...(accent && {
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0 0 auto 0',
            height: 2,
            bgcolor: `${color}.main`,
            opacity: 0.85,
          },
        }),
      }}
    >
      <Box sx={{ p: { xs: 2, sm: 2.25 }, display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography
            variant="overline"
            component="div"
            sx={{ color: 'text.secondary', fontSize: '0.625rem', lineHeight: 1.4, minWidth: 0 }}
            noWrap
          >
            {label}
          </Typography>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: 1.5,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.light`,
              color: (t) => (t.palette.mode === 'light' ? `${color}.dark` : `${color}.main`),
            }}
          >
            {Icon && <Icon sx={{ fontSize: 17 }} />}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
          {loading ? (
            <Skeleton width={72} height={38} sx={{ transform: 'none' }} />
          ) : (
            <Typography
              className="tnum"
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em' }}
            >
              {value ?? '—'}
            </Typography>
          )}
          {trend && !loading && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.25,
                color: trend.positive ? 'success.main' : 'error.main',
              }}
            >
              {trend.positive ? (
                <TrendingUpIcon sx={{ fontSize: 15 }} />
              ) : (
                <TrendingDownIcon sx={{ fontSize: 15 }} />
              )}
              <Typography variant="caption" sx={{ fontWeight: 650 }}>
                {trend.value}
              </Typography>
            </Box>
          )}
        </Box>

        {hint && !loading && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: -0.75, display: 'block' }}>
            {hint}
          </Typography>
        )}
        {footer && <Box sx={{ mt: 'auto', pt: 0.5 }}>{footer}</Box>}
      </Box>
    </Card>
  )
}
